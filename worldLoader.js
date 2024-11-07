//worldloarder.js
import { CurveSegment} from './utils.js';

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

    const curveData = await loadVertices('platform_track.json');
    const mainCurveSegments = curveData.mainCurveSegments.map(segment => new CurveSegment(segment.P0, segment.P1, segment.T0, segment.T1));
    const  leftRailSegments = curveData.leftRailSegments.map( segment => new CurveSegment(segment.P0, segment.P1, segment.T0, segment.T1));
    const rightRailSegments = curveData.rightRailSegments.map(segment => new CurveSegment(segment.P0, segment.P1, segment.T0, segment.T1));
    
    return {
        base,
        grid,
        cube,
        bullet,
        gun,
        muzzle,
        platform,
        platform_grid,
        mainCurveSegments,
        leftRailSegments,
        rightRailSegments
    };
}