// Preload during static-build verification; any accidental API read fails the build.
globalThis.fetch = () => { throw new Error('Network disabled for Food Visualizer static-build verification') }
