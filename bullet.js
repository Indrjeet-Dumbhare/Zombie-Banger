import * as LJS from 'littlejsengine';




export class BulletClass extends LJS.EngineObject{

    mouse_pos = LJS.vec2(0,0);
    constructor(pos,player_pos){
        super(pos);
        this.bulletStartPos = player_pos;

        this.bulletPos = this.bulletStartPos;

        this.bulletPos.setDirection(this.bullteEndPos - this.bulletStartPos);
    }

    doesPierce = false;
    bulletBounceThreshold = 3; 
    bouncesHappened = 0;
    lifeTimeOver = false;
    bulletVelocity = 0;

    //For now bullet is just a rectangle
    bulletStartPos = LJS.vec2(0,0);
    bullteEndPos = LJS.vec2(0,0);


    update(){
        // if(this.bouncesHappened>this.bulletBounceThreshold){
        //     this.lifeTimeOver = true;
        // }
        
        // if(this.bulletPos.distance % 20 == 0){
        //     this.bouncesHappened++;
        // }

    }

    render(){
        // LJS.drawCircle(this.mouse_pos,10,LJS.GREEN);
        LJS.drawRect(this.mouse_pos,LJS.vec2(5,5),LJS.RED);
    }


}