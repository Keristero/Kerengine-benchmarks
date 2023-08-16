import {
    createWorld,
    Types,
    defineComponent,
    defineQuery,
    addEntity,
    addComponent,
    pipe,
    setDefaultSize
  } from 'https://cdn.jsdelivr.net/npm/bitecs@0.3.19-1/dist/index.mjs'
import RNG from '../../PeerlessEngine/utilities/RNG.js'

console.log('weeee')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.font = "40px Arial";
ctx.fillStyle = 'black'

let test_entities = 20000000
let target_frametime = 16.66
let last_frame_timestamp = 0
let frame_times = []

const world = createWorld()
world.time = { delta: 0, elapsed: 0, then: performance.now() }
setDefaultSize(test_entities)

const Dimensions = { width: Types.i8, height: Types.i8 }
const Vector2 = { x: Types.i8, y: Types.i8 }
const Rectangle = defineComponent(Dimensions)
const Position = defineComponent(Vector2)
const Velocity = defineComponent(Vector2)

//generate a bunch of test rectangles
for(let i = 0; i < test_entities; i++){
    let new_rect = addEntity(world)
    addComponent(world, Position, new_rect)
    addComponent(world, Rectangle, new_rect)
    addComponent(world, Velocity, new_rect)
    Rectangle.width[new_rect] = RNG.Int(2,5)
    Rectangle.height[new_rect] = RNG.Int(2,5)
    Position.x[new_rect] = RNG.Int(0,canvas.width)
    Position.y[new_rect] = RNG.Int(0,canvas.height)
    Velocity.x[new_rect] = RNG.Int(-2,2)
    Velocity.y[new_rect] = RNG.Int(-2,2)
}

const movementQuery = defineQuery([Position, Velocity])
const movementSystem = (world) => {
    const { time: { delta } } = world
    const ents = movementQuery(world)
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        Position.x[eid] += Velocity.x[eid]
        Position.y[eid] += Velocity.y[eid]
        //bounce em if they leave the screen
        if(Position.x[eid] <= 0 || Position.x[eid] >= canvas.width){
            Velocity.x[eid] *= -1
        }
        if(Position.y[eid] <= 0 || Position.y[eid] >= canvas.height){
            Velocity.y[eid] *= -1
        }
    }
    return world
}

const renderQuery = defineQuery([Position, Rectangle])
const renderSystem = (world) => {
    let { frame_time } = world
    const ents = movementQuery(world)

    //clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height)
    /*
    ctx.fillStyle = "grey"
    for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        let x = Position.x[eid]
        let y = Position.y[eid]
        let width = Rectangle.width[eid]
        let height = Rectangle.height[eid]
        ctx.fillRect(x,y,width,height)
    }
    */
    //draw performance metrics
    ctx.fillStyle = "blue"
    ctx.fillText(`(${Math.floor(frame_time)}/${Math.floor(target_frametime)})ms`, 50, 50);
    return world
}

const framerateSystem = (world) => {
    let timestamp = performance.now()
    let delta = Math.abs(last_frame_timestamp-timestamp)
    last_frame_timestamp = timestamp
    frame_times.push(delta)
    if(frame_times.length > 10){
        frame_times.shift()
    }
    world.frame_time = frame_times.reduce((sum, i) => sum + i, 0)/frame_times.length;
    return world
}

const pipeline = pipe(framerateSystem,movementSystem,renderSystem)

setInterval(() => {
    pipeline(world)
}, target_frametime)