<script lang="ts">
	import { browser } from '$app/environment';
	import { AccordionItem, Button, Drawer, Input, Label } from 'flowbite-svelte';

	$: files = undefined;
	$: error = undefined as string | undefined;

	$: loadFile(files);

	function loadFile(files?: FileList) {
		console.log(files);
		if (!browser || !files || files?.length === 0) return;

		try {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = (e) => {
				const contents = e.target?.result as string;
				const config = JSON.parse(contents);
				readValues(config);
			};
			reader.readAsText(file);
		} catch (e) {
			error = 'Failed to load file. Please make sure it is a valid SkyHanni config file.';
			console.error(e);
		}
	}

	interface SkyHanniConfig {
		storage: {
			players?: {
				[uuid: string]:
					| {
							profiles?: {
								[profile: string]:
									| {
											garden?: {
												experience?: number;
												cropUpgrades?: Record<string, number>;
												fortune?: {
													carrotFortune?: number;
													pumpkinFortune?: number;
													plotsUnlocked?: number;
												};
											};
									  }
									| undefined;
							};
							gardenCommunityUpgrade?: number;
					  }
					| undefined;
			};
		};
	}

	function readValues(config: unknown) {
		if (!config || typeof config !== 'object') {
			error = 'Failed to load file. Please make sure it is a valid SkyHanni config file.';
			return;
		}

		if ('storage' in config) {
			const storage = config?.storage as Record<string, unknown>;
			if ('players' in storage) {
				
			}
		}
	}
</script>

<AccordionItem
	defaultClass="flex flex-row items-center justify-center gap-4 w-full"
	textFlushDefault="text-black dark:text-white py-1 border-none"
	paddingFlush="py-1 px-4"
	borderSharedClass="border-none"
>
	<div slot="header">Load From SkyHanni Config</div>
	<div class="flex flex-col items-center justify-center gap-2">
		<div class="flex flex-row items-center gap-2">
			<Input type="file" accept=".json" let:props>
				<input type="file" {...props} bind:files />
			</Input>
		</div>
		<Button color="primary">Upload</Button>
	</div>
</AccordionItem>
