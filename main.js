import Position from './PeerlessEngine/builtins/components/Position.js'
import Rectangle from './PeerlessEngine/builtins/components/Rectangle.js'
import Velocity from './PeerlessEngine/builtins/components/Velocity.js'
import peerlessengine from './PeerlessEngine/PeerlessEngine.js'
import RNG from './PeerlessEngine/utilities/RNG.js'

const valid_dot = peerlessengine.get_next_id()
Position.Add(valid_dot,{x:2,y:5})

console.log(Rectangle)

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.font = "40px Arial";
ctx.fillStyle = 'black'

//generate a bunch of test rectangles
for(let i = 0; i < 30000; i++){
    let new_rect = peerlessengine.get_next_id()
    Rectangle.Add(new_rect,{width:RNG.Int(3,5),height:RNG.Int(3,5)})
    Position.Add(new_rect,{x:RNG.Int(0,canvas.width),y:RNG.Int(0,canvas.height)})
    Velocity.Add(new_rect,{x:RNG.Int(-2,2),y:RNG.Int(-2,2)})
}

let target_frametime = 16.66
let last_frame_timestamp = 0
let frame_times = []

function main(){
    //queue next update
    setTimeout(main,target_frametime)
    //measure framerate
    let timestamp = performance.now()
    let delta = Math.abs(last_frame_timestamp-timestamp)
    last_frame_timestamp = timestamp
    frame_times.push(delta)
    if(frame_times.length > 10){
        frame_times.shift()
    }
    let frame_time = frame_times.reduce((sum, i) => sum + i, 0)/frame_times.length;

    //clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height)

    let cool_rectangles = peerlessengine.get_entities([Position,Rectangle,Velocity])
    //move em
    for(let rect in cool_rectangles){
        Position.x[rect] += Velocity.x[rect]
        Position.y[rect] += Velocity.y[rect]
        //bounce em if they leave the screen
        if(Position.x[rect] <= 0 || Position.x[rect] >= canvas.width){
            Velocity.x[rect] *= -1
        }
        if(Position.y[rect] <= 0 || Position.y[rect] >= canvas.height){
            Velocity.y[rect] *= -1
        }
    }

    //draw em
    ctx.fillStyle = "black"
    for(let rect in cool_rectangles){
        let x = Position.x[rect]
        let y = Position.y[rect]
        let width = Rectangle.width[rect]
        let height = Rectangle.height[rect]
        ctx.fillRect(x,y,width,height)
    }

    //draw performance metrics
    ctx.fillStyle = "blue"
    ctx.fillText(`(${Math.floor(frame_time)}/${Math.floor(target_frametime)})ms`, 50, 50);
}

main()