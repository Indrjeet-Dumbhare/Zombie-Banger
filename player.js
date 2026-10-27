import * as LJS from 'littlejsengine';
import { Objects} from './Objects';

let RayDists = new Map();
let NextRayDists = new Map();


// Idk how this shit turly works but this function calculates the normal from the coming ray from start with a dir 
// based on that it evaluates the normal dir and the point the ray hits.
function rayRecHit(start, dir, rect) {
    const halfX = rect.size.x / 2;
    const halfY = rect.size.y / 2;

    const minX = rect.pos.x - halfX;
    const maxX = rect.pos.x + halfX;
    const minY = rect.pos.y - halfY;
    const maxY = rect.pos.y + halfY;

    let tMin = -Infinity;
    let tMax = Infinity;
    let normal = null;

    for (const [origin, direction, min, max, negNormal, posNormal] of [
        [start.x, dir.x, minX, maxX, LJS.vec2(-1, 0), LJS.vec2(1, 0)],
        [start.y, dir.y, minY, maxY, LJS.vec2(0, -1), LJS.vec2(0, 1)]
    ]) {
        if (Math.abs(direction) < 1e-8) {
            if (origin < min || origin > max)
                return null;
            continue;
        }

        let t1 = (min - origin) / direction;
        let t2 = (max - origin) / direction;

        let entryNormal = negNormal;

        if (t1 > t2) {
            [t1, t2] = [t2, t1];
            entryNormal = posNormal;
        }

        if (t1 > tMin) {
            tMin = t1;
            normal = entryNormal;
        }

        tMax = Math.min(tMax, t2);

        if (tMin > tMax)
            return null;
    }

    // Rectangle is entirely behind the ray
    if (tMax < 0)
        return null;

    // If starting inside, return the exit intersection
    if (tMin < 0) {
        tMin = tMax;
        normal = null;
    }

    return {
        hit: true,
        point: LJS.vec2(
            start.x + dir.x * tMin,
            start.y + dir.y * tMin
        ),
        normal,
        distance: tMin * Math.sqrt(dir.x * dir.x + dir.y * dir.y)
    };
}

let index  =0 ;

function CalculatePath(start,dir,n_bounces,maxDistance = 2000, drawStart = start, rayMap = RayDists) {
    if (n_bounces <= 0) return;
    
    dir = dir.normalize();

    let nearestHit = null;
    let nearestDistance = Infinity;
    // goes through each object and check if the ray hits the rect
    for (const rect of Objects) {
        const hit = rayRecHit(start, dir, rect);

        if (!hit || !hit.normal) // if not exit and move on to other rects
            continue;

        // cal the distance of hit point and the player pos 
        const distance = hit.point.subtract(start).length();

        // if the distance is less than nearestDistance 
        // assign the nearestDistance to it, this will make sure to reflect the ray from the objects which are closer to player first.
        if (distance > 1e-4 && distance < nearestDistance) {
            nearestDistance = distance;
            nearestHit = hit;
        }
    }

    // if the ray doesnt hit, scale that vector to match the length of the last hit point / start point to the end point.
    if (!nearestHit || nearestDistance > maxDistance) {
        rayMap.set(index++, { start: drawStart, end: start.add(dir.scale(maxDistance))});
        return;
    }

    //set the start and end of the last ray
    rayMap.set(index++, {start: drawStart, end: nearestHit.point});

    //Calculate reflected ray 
    const reflected = dir.subtract( nearestHit.normal.scale(2 * dir.dot(nearestHit.normal))).normalize();
    const nextStart = nearestHit.point;

    CalculatePath(nextStart,reflected,n_bounces - 1,maxDistance,nearestHit.point,rayMap);
}


export class PlayerClass extends LJS.EngineObject{
    mousePosLoc=LJS.vec2(0,0);
    player_size=0;
    angle_of_trajectory = 0;
    playerStartPos = LJS.vec2(0);
    bullets=[];

    startMoving = false;

    constructor(pos,p_s) {
        super(pos);
        this.player_size = p_s;
        this.playerStartPos = this.pos;

    }

    update(){
        NextRayDists.clear();
        index = 0;
        this.mousePosLoc = LJS.mousePos;

        const start_pos = this.pos;
        const dir = this.mousePosLoc.subtract(this.pos).normalize();


        //Repalce the 3 with threshold val
        CalculatePath(start_pos, dir, 3, 2000, start_pos, NextRayDists);
       
        [RayDists, NextRayDists] = [NextRayDists, RayDists];
    }

    render(){
        LJS.drawCircle(this.pos, this.player_size, LJS.GREEN);
        LJS.drawCircle(this.mousePosLoc,5,LJS.RED);
        

        RayDists.forEach(element => {
                LJS.drawLine(element.start,element.end,1,LJS.RED);
        });
        
    }
    
}
