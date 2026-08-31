<script lang="ts">
	import { trackAnalytics } from '$lib/analytics';
	import type { SchematicViewerStatusDto } from '$lib/api/schemas';
	import { PollGuideSchematicViewer } from '$lib/remote/guides.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { SliderSimple } from '$ui/slider';
	import Box from '@lucide/svelte/icons/box';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Expand from '@lucide/svelte/icons/expand';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, tick } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type {
		BufferGeometry,
		Material,
		Mesh,
		Object3D,
		OrthographicCamera,
		PerspectiveCamera,
		Scene,
		Texture,
		WebGLRenderer,
	} from 'three';
	import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

	interface Props {
		assetId: string;
	}
	type CameraProjection = 'perspective' | 'orthographic';
	type ViewerCamera = PerspectiveCamera | OrthographicCamera;

	let { assetId }: Props = $props();
	let shell: HTMLDivElement | undefined = $state();
	let viewport: HTMLDivElement | undefined = $state();
	let viewerCanvas: HTMLCanvasElement | undefined;
	let expanded = $state(false);
	let status = $state<SchematicViewerStatusDto | null>(null);
	let loadingStatus = $state(false);
	let loadingModel = $state(false);
	let modelLoadProgress = $state<number | null>(null);
	let viewerError = $state<string | null>(null);
	let layerMode = $state<'all' | 'single'>('all');
	let cameraProjection = $state<CameraProjection>('perspective');
	let selectedLayerIndex = $state(0);
	let layers = $state<number[]>([]);

	let renderer: WebGLRenderer | null = null;
	let scene: Scene | null = null;
	let camera: ViewerCamera | null = null;
	let controls: OrbitControls | null = null;
	let modelRoot = $state.raw<Object3D | null>(null);
	let layerObjects = new SvelteMap<number, Object3D>();
	let sliceCapObjects = new SvelteMap<number, Object3D>();
	let resizeObserver: ResizeObserver | null = null;
	let intersectionObserver: IntersectionObserver | null = null;
	let viewportVisible = true;
	let animationFrame = 0;
	let pollTimer: ReturnType<typeof setTimeout> | null = null;
	let resetCamera: (() => void) | null = null;
	let activeAssetId: string | null = null;
	let viewerSession = 0;
	let statusRequest = 0;
	let pollFailureCount = 0;
	let loadingModelUrl: string | null = null;
	let modelAbortController: AbortController | null = null;
	let changeCameraProjection: ((projection: CameraProjection) => void) | null = null;
	let resizeViewer: (() => void) | null = null;
	let threeRuntimePromise: ReturnType<typeof loadThreeRuntime> | null = null;

	const maximumModelBytes = 128 * 1024 * 1024;

	const isPending = $derived(status?.status === 'queued' || status?.status === 'processing');
	const isReady = $derived(status?.status === 'ready' && Boolean(status.modelUrl));
	const selectedY = $derived(layers[selectedLayerIndex] ?? layers[0] ?? status?.minY ?? 0);

	const attachViewerCanvas: Attachment<HTMLCanvasElement> = (canvas) => {
		viewerCanvas = canvas;
		const runtimePromise = getThreeRuntime();
		void runtimePromise.catch(() => {
			if (threeRuntimePromise === runtimePromise) threeRuntimePromise = null;
		});

		return () => {
			if (viewerCanvas !== canvas) return;
			viewerCanvas = undefined;
			disposeViewer();
		};
	};

	function loadThreeRuntime() {
		return Promise.all([
			import('three'),
			import('three/examples/jsm/controls/OrbitControls.js'),
			import('three/examples/jsm/loaders/GLTFLoader.js'),
		]);
	}

	function getThreeRuntime() {
		return (threeRuntimePromise ??= loadThreeRuntime());
	}

	$effect(() => {
		const nextAssetId = assetId;
		if (activeAssetId === null) {
			activeAssetId = nextAssetId;
			return;
		}
		if (nextAssetId === activeAssetId) return;

		activeAssetId = nextAssetId;
		resetViewerState();
		if (expanded) {
			const session = viewerSession;
			void tick().then(() => refreshStatus(session, nextAssetId));
		}
	});

	async function openViewer() {
		trackAnalytics('guides.schematic_viewer_opened');
		expanded = true;
		resetViewerState();
		const session = viewerSession;
		const requestedAssetId = assetId;
		await tick();
		await refreshStatus(session, requestedAssetId);
	}

	function closeViewer() {
		expanded = false;
		resetViewerState();
	}

	async function refreshStatus(session = viewerSession, requestedAssetId = assetId) {
		if (!isCurrentViewer(session, requestedAssetId)) return;

		stopPolling();
		const request = ++statusRequest;
		loadingStatus = true;
		try {
			const nextStatus = await PollGuideSchematicViewer(requestedAssetId);
			if (!isCurrentRequest(session, requestedAssetId, request)) return;

			status = nextStatus;
			viewerError = null;
			pollFailureCount = 0;
			if (!nextStatus) {
				viewerError = 'The 3D viewer is not available for this schematic.';
				return;
			}
			if (nextStatus.status === 'ready' && nextStatus.modelUrl) {
				stopPolling();
				await loadModel(nextStatus.modelUrl, session, requestedAssetId);
			} else if (nextStatus.status === 'queued' || nextStatus.status === 'processing') {
				schedulePoll(2500, session, requestedAssetId);
			}
		} catch {
			if (!isCurrentRequest(session, requestedAssetId, request)) return;

			status = null;
			viewerError = 'Could not load the schematic viewer status.';
			pollFailureCount += 1;
			const retryDelay = Math.min(2500 * 2 ** (pollFailureCount - 1), 15000);
			schedulePoll(retryDelay, session, requestedAssetId);
		} finally {
			if (isCurrentRequest(session, requestedAssetId, request)) loadingStatus = false;
		}
	}

	function schedulePoll(delay: number, session: number, requestedAssetId: string) {
		stopPolling();
		pollTimer = setTimeout(() => {
			pollTimer = null;
			void refreshStatus(session, requestedAssetId);
		}, delay);
	}

	function stopPolling() {
		if (pollTimer) clearTimeout(pollTimer);
		pollTimer = null;
	}

	async function loadModel(modelUrl: string, session: number, requestedAssetId: string) {
		if (
			!viewerCanvas ||
			!viewport ||
			(modelRoot && modelRoot.userData.sourceUrl === modelUrl) ||
			loadingModelUrl === modelUrl
		)
			return;

		loadingModel = true;
		modelLoadProgress = null;
		loadingModelUrl = modelUrl;
		viewerError = null;
		disposeViewer();
		let requestController: AbortController | null = null;
		try {
			const [THREE, { OrbitControls }, { GLTFLoader }] = await getThreeRuntime();
			if (!isCurrentViewer(session, requestedAssetId) || !viewport || !viewerCanvas) return;

			scene = new THREE.Scene();
			scene.background = new THREE.Color(0x0b1018);
			let orthographicHalfHeight = 1;
			const viewportAspect = () =>
				Math.max(viewport?.clientWidth ?? 1, 1) / Math.max(viewport?.clientHeight ?? 1, 1);
			const createCamera = (projection: CameraProjection) =>
				projection === 'orthographic'
					? new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 5000)
					: new THREE.PerspectiveCamera(45, viewportAspect(), 0.05, 5000);
			camera = createCamera(cameraProjection);
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				canvas: viewerCanvas,
				powerPreference: 'high-performance',
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.outputColorSpace = THREE.SRGBColorSpace;

			controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.screenSpacePanning = true;
			controls.maxDistance = 4000;
			controls.listenToKeyEvents(renderer.domElement);

			const resize = () => {
				if (!viewport || !camera || !renderer) return;
				const width = Math.max(viewport.clientWidth, 1);
				const height = Math.max(viewport.clientHeight, 1);
				const aspect = width / height;
				if (camera instanceof THREE.PerspectiveCamera) {
					camera.aspect = aspect;
				} else {
					camera.left = -orthographicHalfHeight * aspect;
					camera.right = orthographicHalfHeight * aspect;
					camera.top = orthographicHalfHeight;
					camera.bottom = -orthographicHalfHeight;
				}
				camera.updateProjectionMatrix();
				renderer.setSize(width, height, false);
			};
			resizeViewer = resize;

			requestController = new AbortController();
			modelAbortController = requestController;
			const modelBuffer = await downloadModel(modelUrl, requestController.signal);
			const resourcePath = new URL('.', new URL(modelUrl, window.location.href)).href;
			const gltf = await new GLTFLoader().parseAsync(modelBuffer, resourcePath);
			if (!isCurrentViewer(session, requestedAssetId)) {
				disposeObjectResources(gltf.scene);
				return;
			}

			modelRoot = gltf.scene;
			modelRoot.userData.sourceUrl = modelUrl;
			layerObjects = new SvelteMap();
			sliceCapObjects = new SvelteMap();
			modelRoot.traverse((object) => {
				if ('material' in object) {
					const mesh = object as Mesh;
					const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
					for (const material of materials) {
						if (material.transparent) {
							material.depthWrite = false;
							material.needsUpdate = true;
						}
					}
				}

				const namedSliceCap = object.name.match(/^elite:slice-cap:(-?\d+)$/)?.[1];
				const sliceCapY =
					typeof object.userData.eliteSliceCapY === 'number'
						? object.userData.eliteSliceCapY
						: Number(namedSliceCap);
				if (Number.isFinite(sliceCapY)) {
					object.visible = false;
					sliceCapObjects.set(sliceCapY, object);
					return;
				}

				const namedLayer = object.name.match(/^elite:layer:(-?\d+)$/)?.[1];
				const y = typeof object.userData.eliteY === 'number' ? object.userData.eliteY : Number(namedLayer);
				if (Number.isFinite(y)) layerObjects.set(y, object);
			});
			scene.add(modelRoot);
			layers = [...layerObjects.keys()].sort((a, b) => a - b);
			selectedLayerIndex = 0;

			const initialBounds = new THREE.Box3().setFromObject(modelRoot);
			const initialCenter = initialBounds.getCenter(new THREE.Vector3());
			modelRoot.position.sub(initialCenter);
			modelRoot.updateMatrixWorld(true);
			resetCamera = () => {
				if (!camera || !controls) return;
				const targetObject = layerMode === 'single' ? layerObjects.get(selectedY) : modelRoot;
				if (!targetObject) return;
				const bounds = new THREE.Box3().setFromObject(targetObject);
				if (bounds.isEmpty()) return;
				const size = bounds.getSize(new THREE.Vector3());
				const center = bounds.getCenter(new THREE.Vector3());
				const radius = Math.max(size.length() * 0.55, 2);
				camera.position.set(center.x + radius * 0.9, center.y + radius * 0.65, center.z + radius * 0.9);
				camera.near = Math.max(radius / 1000, 0.01);
				camera.far = Math.max(radius * 20, 100);
				camera.zoom = 1;
				if (camera instanceof THREE.OrthographicCamera) orthographicHalfHeight = radius;
				resize();
				controls.target.copy(center);
				controls.update();
			};
			changeCameraProjection = (projection) => {
				if (!camera || !controls || projection === cameraProjection) return;

				const previousCamera = camera;
				const target = controls.target.clone();
				const offset = previousCamera.position.clone().sub(target);
				const direction = offset.lengthSq() > 0 ? offset.normalize() : new THREE.Vector3(1, 0.7, 1).normalize();
				let distance = Math.max(previousCamera.position.distanceTo(target), 1);
				if (projection === 'orthographic' && previousCamera instanceof THREE.PerspectiveCamera) {
					orthographicHalfHeight = Math.tan(THREE.MathUtils.degToRad(previousCamera.fov * 0.5)) * distance;
				} else if (projection === 'perspective' && previousCamera instanceof THREE.OrthographicCamera) {
					const visibleHalfHeight = orthographicHalfHeight / Math.max(previousCamera.zoom, 0.01);
					distance = visibleHalfHeight / Math.tan(THREE.MathUtils.degToRad(45 * 0.5));
				}

				const nextCamera = createCamera(projection);
				nextCamera.position.copy(target).addScaledVector(direction, distance);
				nextCamera.up.copy(previousCamera.up);
				nextCamera.near = Math.max(distance / 1000, 0.01);
				nextCamera.far = Math.max(distance * 20, 100);
				camera = nextCamera;
				controls.object = nextCamera;
				controls.target.copy(target);
				resize();
				controls.update();
			};
			resetCamera();
			applyLayerVisibility();

			resizeObserver = new ResizeObserver(resize);
			resizeObserver.observe(viewport);
			intersectionObserver = new IntersectionObserver(([entry]) => {
				viewportVisible = entry?.isIntersecting ?? true;
			});
			intersectionObserver.observe(viewport);
			resize();

			const renderFrame = () => {
				if (viewportVisible) {
					controls?.update();
					if (scene && camera) renderer?.render(scene, camera);
				}
				animationFrame = requestAnimationFrame(renderFrame);
			};
			renderFrame();
		} catch (error) {
			if (!isCurrentViewer(session, requestedAssetId)) return;

			viewerError =
				error instanceof Error && error.name !== 'AbortError'
					? error.message
					: 'The 3D model could not be loaded.';
			disposeViewer();
		} finally {
			if (requestController && modelAbortController === requestController) modelAbortController = null;
			if (isCurrentViewer(session, requestedAssetId) && loadingModelUrl === modelUrl) {
				loadingModel = false;
				modelLoadProgress = null;
				loadingModelUrl = null;
			}
		}
	}

	async function downloadModel(modelUrl: string, signal: AbortSignal) {
		const response = await fetch(modelUrl, { credentials: 'omit', mode: 'cors', signal });
		if (!response.ok) throw new Error('The 3D model could not be downloaded.');

		const contentLengthHeader = response.headers.get('content-length');
		const declaredLength = contentLengthHeader === null ? Number.NaN : Number(contentLengthHeader);
		if (Number.isFinite(declaredLength) && declaredLength > maximumModelBytes) {
			await response.body?.cancel();
			throw new Error('This 3D model is too large to open in the browser.');
		}

		if (!response.body) {
			const buffer = await response.arrayBuffer();
			if (buffer.byteLength > maximumModelBytes) {
				throw new Error('This 3D model is too large to open in the browser.');
			}
			return buffer;
		}

		const reader = response.body.getReader();
		const hasDeclaredLength = Number.isSafeInteger(declaredLength) && declaredLength >= 0;
		const declaredBytes = hasDeclaredLength ? new Uint8Array(declaredLength) : null;
		const chunks: Uint8Array[] = [];
		let downloadedBytes = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			downloadedBytes += value.byteLength;
			if (downloadedBytes > maximumModelBytes) {
				await reader.cancel();
				throw new Error('This 3D model is too large to open in the browser.');
			}

			if (declaredBytes) {
				if (downloadedBytes > declaredBytes.byteLength) {
					await reader.cancel();
					throw new Error('The 3D model response has an invalid size.');
				}
				declaredBytes.set(value, downloadedBytes - value.byteLength);
			} else {
				chunks.push(value);
			}
			if (Number.isFinite(declaredLength) && declaredLength > 0) {
				modelLoadProgress = Math.min(99, Math.round((downloadedBytes / declaredLength) * 100));
			}
		}

		if (declaredBytes) {
			if (downloadedBytes !== declaredBytes.byteLength) {
				throw new Error('The 3D model response ended before it was complete.');
			}
			modelLoadProgress = 100;
			return declaredBytes.buffer;
		}

		const bytes = new Uint8Array(downloadedBytes);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.byteLength;
		}
		modelLoadProgress = 100;
		return bytes.buffer;
	}

	function setLayerMode(mode: 'all' | 'single') {
		layerMode = mode;
		applyLayerVisibility();
	}

	function setCameraProjection(projection: CameraProjection) {
		if (cameraProjection === projection) return;
		changeCameraProjection?.(projection);
		cameraProjection = projection;
	}

	function setSelectedLayer(index: number) {
		selectedLayerIndex = Math.min(layers.length - 1, Math.max(0, Math.round(index)));
		applyLayerVisibility();
	}

	function applyLayerVisibility() {
		for (const [y, object] of layerObjects) object.visible = layerMode === 'all' || y === selectedY;
		for (const [y, object] of sliceCapObjects) object.visible = layerMode === 'single' && y === selectedY;
	}

	function isCurrentViewer(session: number, requestedAssetId: string) {
		return expanded && viewerSession === session && assetId === requestedAssetId;
	}

	function isCurrentRequest(session: number, requestedAssetId: string, request: number) {
		return isCurrentViewer(session, requestedAssetId) && statusRequest === request;
	}

	function resetViewerState() {
		viewerSession += 1;
		statusRequest += 1;
		stopPolling();
		disposeViewer();
		status = null;
		viewerError = null;
		loadingStatus = false;
		loadingModel = false;
		modelLoadProgress = null;
		loadingModelUrl = null;
		pollFailureCount = 0;
		layerMode = 'all';
		cameraProjection = 'perspective';
		selectedLayerIndex = 0;
		layers = [];
	}

	async function toggleFullscreen() {
		if (!shell) return;
		try {
			if (document.fullscreenElement) await document.exitFullscreen();
			else await shell.requestFullscreen();
			await tick();
			resizeViewer?.();
		} catch {
			viewerError = 'Fullscreen could not be opened.';
		}
	}

	function disposeViewer() {
		modelAbortController?.abort();
		modelAbortController = null;
		if (animationFrame) cancelAnimationFrame(animationFrame);
		animationFrame = 0;
		resizeObserver?.disconnect();
		resizeObserver = null;
		intersectionObserver?.disconnect();
		intersectionObserver = null;
		viewportVisible = true;
		controls?.stopListenToKeyEvents();
		controls?.dispose();
		controls = null;
		if (modelRoot) disposeObjectResources(modelRoot);
		renderer?.dispose();
		renderer = null;
		scene = null;
		camera = null;
		modelRoot = null;
		layerObjects.clear();
		sliceCapObjects.clear();
		resetCamera = null;
		changeCameraProjection = null;
		resizeViewer = null;
	}

	async function handleFullscreenChange() {
		await tick();
		resizeViewer?.();
	}

	function disposeObjectResources(root: Object3D) {
		const geometries = new SvelteSet<BufferGeometry>();
		const materials = new SvelteSet<Material>();
		const textures = new SvelteSet<Texture>();

		root.traverse((object) => {
			if (!('geometry' in object) || !('material' in object)) return;
			const mesh = object as Mesh;
			if (mesh.geometry) geometries.add(mesh.geometry);
			const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
			for (const material of meshMaterials) {
				if (!material) continue;
				materials.add(material);
				for (const value of Object.values(material)) {
					if (value && typeof value === 'object' && 'isTexture' in value) textures.add(value as Texture);
				}
			}
		});

		for (const texture of textures) texture.dispose();
		for (const material of materials) material.dispose();
		for (const geometry of geometries) geometry.dispose();
	}

	onDestroy(() => {
		viewerSession += 1;
		statusRequest += 1;
		stopPolling();
		disposeViewer();
	});
</script>

<svelte:document onfullscreenchange={handleFullscreenChange} />

{#if !expanded}
	<Button variant="secondary" size="sm" onclick={openViewer}>
		<Box class="mr-2 size-4" />
		View in 3D
	</Button>
{:else}
	<div
		bind:this={shell}
		class="overflow-hidden rounded-md border bg-background fullscreen:flex fullscreen:h-dvh fullscreen:w-screen fullscreen:flex-col fullscreen:rounded-none fullscreen:border-0"
	>
		<div class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">3D schematic</span>
				{#if isPending}
					<Badge variant="secondary"><Loader2 class="mr-1 size-3 animate-spin" />Generating</Badge>
				{:else if status?.status === 'failed'}
					<Badge variant="destructive">Failed</Badge>
				{:else if isReady}
					<Badge variant="outline">{status?.blockCount?.toLocaleString() ?? 0} blocks</Badge>
				{/if}
			</div>
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					onclick={() => resetCamera?.()}
					disabled={!modelRoot}
					aria-label="Reset camera"
				>
					<RotateCcw class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					onclick={toggleFullscreen}
					aria-label="Toggle fullscreen"
				>
					<Expand class="size-4" />
				</Button>
				<Button variant="ghost" size="icon" class="size-8" onclick={closeViewer} aria-label="Close 3D viewer">
					<X class="size-4" />
				</Button>
			</div>
		</div>

		{#if modelRoot && layers.length > 0}
			<div class="shrink-0 space-y-3 border-b px-3 py-3">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div class="flex flex-wrap items-center gap-2">
						<div class="flex items-center rounded-md border p-0.5" aria-label="Layer display mode">
							<Button
								variant={layerMode === 'all' ? 'secondary' : 'ghost'}
								size="sm"
								onclick={() => setLayerMode('all')}>All levels</Button
							>
							<Button
								variant={layerMode === 'single' ? 'secondary' : 'ghost'}
								size="sm"
								onclick={() => setLayerMode('single')}>Single level</Button
							>
						</div>
						<div class="flex items-center rounded-md border p-0.5" aria-label="Camera projection">
							<Button
								variant={cameraProjection === 'perspective' ? 'secondary' : 'ghost'}
								size="sm"
								onclick={() => setCameraProjection('perspective')}>Perspective</Button
							>
							<Button
								variant={cameraProjection === 'orthographic' ? 'secondary' : 'ghost'}
								size="sm"
								onclick={() => setCameraProjection('orthographic')}>Orthographic</Button
							>
						</div>
					</div>
				</div>
				{#if layerMode === 'single'}
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							class="size-8"
							onclick={() => setSelectedLayer(selectedLayerIndex - 1)}
							disabled={selectedLayerIndex <= 0}
							aria-label="Previous Y level"
						>
							<ChevronLeft class="size-4" />
						</Button>
						<SliderSimple
							value={selectedLayerIndex}
							onValueChange={setSelectedLayer}
							min={0}
							max={layers.length - 1}
							step={1}
							aria-label="Visible Y level"
						/>
						<Badge variant="outline" class="min-w-14 justify-center">Y {selectedY}</Badge>
						<Button
							variant="outline"
							size="icon"
							class="size-8"
							onclick={() => setSelectedLayer(selectedLayerIndex + 1)}
							disabled={selectedLayerIndex >= layers.length - 1}
							aria-label="Next Y level"
						>
							<ChevronRight class="size-4" />
						</Button>
					</div>
				{/if}
			</div>
		{/if}

		<div
			class="relative h-96 min-h-64 bg-[#0b1018] fullscreen:h-auto fullscreen:min-h-0 fullscreen:flex-1"
			bind:this={viewport}
		>
			<div class="absolute inset-0">
				<canvas
					{@attach attachViewerCanvas}
					class="block size-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
					tabindex="0"
					aria-label="Interactive 3D schematic. Use arrow keys to move the camera after focusing the viewer."
				></canvas>
			</div>
			{#if viewerError || status?.status === 'failed'}
				<div
					class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-6 text-center text-slate-200"
				>
					<TriangleAlert class="size-7 text-amber-400" />
					<p class="text-sm">
						{viewerError ?? status?.errorMessage ?? 'This schematic could not be rendered.'}
					</p>
					<Button variant="secondary" size="sm" onclick={() => refreshStatus()}>Try again</Button>
				</div>
			{:else if loadingStatus || loadingModel || isPending}
				<div
					class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0b1018] text-slate-200"
				>
					<Loader2 class="size-7 animate-spin" />
					<p class="text-sm">
						{isPending
							? 'Building the textured model…'
							: modelLoadProgress === null
								? 'Loading the 3D model…'
								: `Loading the 3D model… ${modelLoadProgress}%`}
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
