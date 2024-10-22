export async function loadVertices(obj) {
    try {
        const response = await fetch("objects/" + obj);
        if (!response.ok) {
            throw new Error("ERRRRRROOOOOR");
        }
        const vertices = await response.json(); 
        return vertices;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function loadWorldObjects() {
    const base = await loadVertices('base.json');
    const grid = await loadVertices('grid.json');
    const cube = await loadVertices('cube.json');
    const bullet = await loadVertices('bullet.json');
    const gun = await loadVertices('gun.json');
    const muzzle = await loadVertices('fm.json');
    const platform = await loadVertices('platform.json');
    const platform_grid = await loadVertices('platform_grid.json');
    
    return {
        base,
        grid,
        cube,
        bullet,
        gun,
        muzzle,
        platform,
        platform_grid
    };
}