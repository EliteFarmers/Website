<script lang="ts">
	import type { components } from '$lib/api/api';
	import Apex from './apex.svelte';
	import type { ApexOptions } from 'apexcharts';
	import { toReadable } from '$lib/format';
	import { browser } from '$app/environment';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { CROP_TO_HEX, PROPER_CROP_NAME } from '$lib/constants/crops';

	export let points: components['schemas']['CropCollectionsDataPointDto'][];

	const anyCropSelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();

	$: data = {} as Record<string, { name: string; data: { x: number; y: number }[] }>;
	$: graphData = Object.values(data).filter(
		({ name }) =>
			name !== 'seeds' &&
			(!$anyCropSelected ||
				$selectedCrops[PROPER_CROP_NAME[name as keyof typeof PROPER_CROP_NAME] as keyof typeof selectedCrops])
	);
	$: colors = graphData.map(({ name }) => CROP_TO_HEX[name] ?? '#000000');

	$: {
		if (browser) {
			const newData = {} as Record<string, { name: string; data: { x: number; y: number }[] }>;
			for (const point of points) {
				const timestamp = (point.timestamp ?? 0) * 1000;
				const crops = Object.entries(point.crops ?? {});

				for (const [crop, value] of crops) {
					const val = { x: timestamp, y: value ?? 0 };
					if (!newData[crop]) newData[crop] = { name: crop, data: [val] };
					newData[crop].data.push(val);
				}
			}
			data = newData;
		}
	}

	$: options = {
		series: [...graphData],
		chart: {
			type: 'area',
			stacked: false,
			height: 350,
			zoom: {
				type: 'xy',
				enabled: true,
			},
			toolbar: {
				autoSelected: 'zoom',
			},
		},
		colors,
		dataLabels: {
			enabled: false,
		},
		markers: {
			colors,
			strokeColors: colors,
			size: 3,
		},
		title: {
			text: 'Crop Collections',
			align: 'left',
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				inverseColors: false,
				opacityFrom: 0.5,
				opacityTo: 0,
				stops: [0, 90, 100],
			},
		},
		stroke: {
			curve: 'straight',
		},
		yaxis: {
			labels: {
				formatter: function (val) {
					return toReadable(val);
				},
			},
			title: {
				text: 'Collection',
			},
		},
		xaxis: {
			type: 'datetime',
		},
		tooltip: {
			shared: false,
			y: {
				formatter: function (val) {
					return val.toLocaleString();
				},
			},
			x: {
				formatter: function (val) {
					return new Date(val).toLocaleString();
				},
			},
		},
	} satisfies ApexOptions;
</script>

<Apex {options} animate={false} />
