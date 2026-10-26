import * as LJS from 'littlejsengine';
import { Objects} from './Objects';


let RayDists=[];

function rayRecHit(start,end,rect){
    const halfX = rect.size.x / 2;
    const halfY = rect.size.y / 2;

    const minX = rect.pos.x - halfX;
    const maxX = rect.pos.x + halfX;
    const minY = rect.pos.y - halfY;
    const maxY = rect.pos.y + halfY;

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    let tMin = 0;
    let tMax = 1;
    let normal = null;

    for (const [origin, direction, min, max, negNormal, posNormal] of [
        [start.x, dx, minX, maxX, LJS.vec2(-1, 0), LJS.vec2(1, 0)],
        [start.y, dy, minY, maxY, LJS.vec2(0, -1), LJS.vec2(0, 1)]
    ]) {
        if (Math.abs(direction) < 1e-8) {
            if (origin < min || origin > max) return null;
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
        if (tMin > tMax) return null;
    }
    if (tMin < 0 || tMin > 1) return null;


    return {
        point: LJS.vec2(start.x + dx * tMin, start.y + dy * tMin),
        normal
    };
}

/*
* @param {Vector2} start
* @param {Vector2} end
* @memberof  */
function CalculatePath(start,end,n_bounces) {
    if(n_bounces == 0) return;
    for (const rect of Objects) {
        const hits = rayRecHit(start,end,rect);

        if (hits && hits.normal) {

            // Vr = V - 2(V.N)N
            const direction = end.subtract(start);
            const reflected = direction.subtract(hits.normal.scale(2*direction.dot(hits.normal)));
            const new_end = hits.point.add(reflected);
            if((start && end && new_end)){
                RayDists.push({start: LJS.vec2(end.x, end.y),end: LJS.vec2(new_end.x, new_end.y)});
            }

            CalculatePath(end,new_end,n_bounces - 1);
        }
    }
    
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
        
        this.mousePosLoc = LJS.mousePos;


        if(this.pos && this.mousePosLoc){
            RayDists.push({start: this.pos,end: this.mousePosLoc});
        }

        CalculatePath(this.pos,this.mousePosLoc,3);



    }

    render(){
        LJS.drawCircle(this.pos, this.player_size, LJS.GREEN);
        LJS.drawCircle(this.mousePosLoc,5,LJS.RED);
        
        // LJS.drawLine(this.playerStartPos,this.mousePosLoc,1,LJS.RED);
        RayDists.forEach(element => {
                console.log("Start:", element.start);
                console.log("End:", element.end);
                LJS.drawLine(element.start,element.end,1,LJS.RED);
        });
        

        RayDists.length = 0;
    }
    
}
