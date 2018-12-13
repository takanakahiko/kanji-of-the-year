import {random, clamp} from './util'

export class Brush{
    private hairs: Hair[] = []
    isTouch:boolean = false

    constructor(
        private size:number,
        private amount:number,
        private ctx:CanvasRenderingContext2D,
    ){}
    
    down(x:number, y:number){
        this.isTouch = true
        const hairNum = this.size * 4
        const rangeMax = this.size
        for (let i = 0; i < hairNum; i++) {
            const range = random(rangeMax, 0)
            const dx = Math.sin(range) * range
            const dy = Math.cos(range) * range
            this.hairs[i] = new Hair(dx, dy, 3, this.amount * random(1, 0.5), this.ctx);
        }
        this.hairs.forEach( h => h.down(x,y) )
    }

    move(x:number, y:number){
        if(this.isTouch) this.hairs.forEach( h => h.move(x,y) )
    }

    up(){
        this.isTouch = false
    }

}

class Hair{
    private x: number = 0
    private y: number = 0

    constructor(
        private dx:number,
        private dy:number,
        private size:number,
        private amount:number,
        private ctx:CanvasRenderingContext2D,
    ){}

    down(parentX:number, parentY:number){
        this.ctx.save()
        this.x = parentX + this.dx
        this.y = parentY + this.dy
        const hsla = new HSLA(1,1,1,1)
        this.ctx.fillStyle = hsla.toString()
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        this.ctx.fill()
        this.ctx.restore()
    }

    move(parentX:number, parentY:number) {
        this.ctx.save()
        const [oldX, oldY] = [this.x , this.y]
        this.x = parentX + this.dx
        this.y = parentY + this.dy
        const hsla = new HSLA(1,1,1,1)
        var speed = Hair.distance(oldX, oldY, this.x, this.y)
        hsla.a = this.amount / speed
        this.ctx.lineCap = 'round'
        this.line(oldX, oldY, this.x, this.y, hsla, this.size/2)
        hsla.a = clamp((1 - speed / this.amount) * 0.3, 0.3, 0)
        this.ctx.lineCap = 'butt'
        this.line(oldX, oldY, this.x, this.y, hsla, this.size)
        this.ctx.restore()
    }

    private line(oldX:number, oldY:number, newX:number, newY:number, hsla:HSLA, width:number){
        this.ctx.strokeStyle = hsla.toString()
        this.ctx.lineWidth = width
        this.ctx.beginPath()
        this.ctx.moveTo(oldX, oldY)
        this.ctx.lineTo(newX, newY)
        this.ctx.stroke()
    }

    static distance(x1: number, y1:number, x2: number, y2:number): number{
    　　return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2));
    }
}

class HSLA{
    constructor(
        public h:number,
        public s:number,
        public l:number,
        public a:number,
    ){}
    toString(){
        return 'hsla(' + this.h + ', ' + this.s + '%, ' + this.l + '%, ' + this.a + ')';
    }
}