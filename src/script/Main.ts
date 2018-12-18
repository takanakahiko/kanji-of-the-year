import {Brush} from "./sub_modules/Brush"
import { getAdjustedPosition } from "./sub_modules/util"

const backgroundSrc = require('../base.jpg');

const start = () => {
    const canvas = <HTMLCanvasElement> window.document.getElementById('canvas')
    const ctx:CanvasRenderingContext2D = canvas.getContext("2d")
    const brush = new Brush(10, 15, ctx)
    canvas.addEventListener('mousedown', (e:MouseEvent) =>{
        const [x,y] = getAdjustedPosition(e.clientX, e.clientY, canvas)
        brush.down(x , y)
    })
    canvas.addEventListener('mousemove' , (e:MouseEvent) =>{
        const [x,y] = getAdjustedPosition(e.clientX, e.clientY, canvas)
        brush.move(x , y)
    })
    canvas.addEventListener('mouseup' , (e:MouseEvent) =>{
        brush.up()
    })
    canvas.addEventListener('mouseover' , (e:MouseEvent) =>{
        brush.up()
    })
    canvas.addEventListener('touchstart', (e:TouchEvent) =>{
        const touchObject = e.touches[0]
        const [x,y] = getAdjustedPosition(touchObject.pageX, touchObject.pageY, canvas)
        brush.down(x , y)
    })
    canvas.addEventListener('touchmove' , (e:TouchEvent) =>{
        e.preventDefault()
        const touchObject = e.touches[0]
        const [x,y] = getAdjustedPosition(touchObject.pageX, touchObject.pageY, canvas)
        brush.move(x , y)
    })
    canvas.addEventListener('touchend' , (e:TouchEvent) =>{
        brush.up()
    })
}

const finish = () => {
    const canvas = <HTMLCanvasElement> window.document.getElementById('canvas')
    const ctx:CanvasRenderingContext2D = canvas.getContext("2d")
    const drawData:string = canvas.toDataURL('image/png')
    const background:HTMLImageElement = new Image();
    background.addEventListener('load',()=>{
        ctx.drawImage(background,0,0, 650, canvas.height)
        const drawImg = new Image()
        drawImg.addEventListener('load',()=>{
            ctx.translate(220,60)
            ctx.transform(0.4, 0, -0.05, 0.6, 50, 50)
            ctx.rotate(5 * Math.PI / 180)
            ctx.drawImage(drawImg, 100, 0)
            var img:HTMLImageElement = document.getElementById("ret") as HTMLImageElement
            img.addEventListener('load',()=>{
                canvas.style.display = 'none'
                img.style.display = 'inline-block'
                document.getElementById('end').style.display = 'none'
                document.getElementById('message').style.display = 'inline'
                document.getElementById('tweet_button').style.display = 'inline'    
            })
            img.src = canvas.toDataURL('image/png')
            const imageBase64 = <HTMLInputElement> document.getElementById('imageBase64')
            imageBase64.value = canvas.toDataURL('image/png')
        })
        drawImg.src = drawData
    })
    background.src = backgroundSrc
}
 
const main = () => {
    start()
    const button2 = <HTMLInputElement> window.document.getElementById('end')
    button2.addEventListener('click' , () =>{
        finish()
    })
}

window.addEventListener("DOMContentLoaded", main);