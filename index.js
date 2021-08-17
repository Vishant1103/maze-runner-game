const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events
  } = Matter;
  
  const cellsHor = 10;
  const cellsVer = 9;
  const width = window.innerWidth - 5;
  const height = window.innerHeight - 5;
  const unitLengthX = width / cellsHor;
  const unitLengthY = height / cellsVer;

  const engine = Engine.create();
  engine.world.gravity.y = 0;
  const { world } = engine;
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes : false,  
      width,
      height
    }
  });
  Render.run(render);
  Runner.run(Runner.create(), engine);
  
  // Boundary Walls////////////////////////////////////////////////////////////////
  const walls = [
    Bodies.rectangle(width / 2, 0, width,  1, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 1, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 1, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 1, height, { isStatic: true })
  ];
  World.add(world, walls);

//maze generation algorithm/////////////////////////////////////////////////////////
const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp; 
    }
    return arr;
}

const grid = Array(cellsVer).fill(null).map( () => {
    return Array(cellsHor).fill(false);
});

const verticals = Array(cellsVer).fill(null).map( () => {
    return Array(cellsHor - 1).fill(false);
});

const horizontals = Array(cellsVer - 1).fill(null).map( () => {
    return Array(cellsHor).fill(false);
});

const startRow = Math.floor(Math.random() * cellsVer);
const startColumn = Math.floor(Math.random() *cellsHor);

const buildMaze = (row, column) => {
    if(grid[row][column] === true) return;
    
    grid[row][column] = true;

    const neighbours = [
        [row - 1, column, "up"],
        [row, column - 1, "left"],
        [row + 1, column, "down"],
        [row, column + 1, "right"]
    ];
    shuffle(neighbours);

    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour;

        if(nextRow < 0 || nextRow >= cellsVer ||nextColumn < 0 || nextColumn >= cellsHor){
            continue;
        }
        if(grid[nextRow][nextColumn] === true){
            continue;
        }

        if(direction === "left"){
            verticals[row][column - 1] = true;
        }
        else if(direction === "right"){
            verticals[row][column] = true;
        }
        else if(direction === "up"){
            horizontals[row - 1][column] = true;
        }
        else if(direction === "down"){
            horizontals[row][column] = true;
        }
        buildMaze(nextRow, nextColumn);
    }
};
buildMaze(startRow, startColumn)

//plotting maze on canvas
horizontals.forEach( (row, rowIndex) => {
    row.forEach( (open, columnIndex) => {
        if(open) return;

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            3,
            {
                label : 'wall',
                isStatic : true,
                render :{
                    fillStyle : 'red'
                }
            }
        );
        World.add(world, wall);
    });
});
  
verticals.forEach( (row, rowIndex) => {
    row.forEach( (open, columnIndex) => {
        if(open) return;

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            3,
            unitLengthY,
            {
                label : 'wall',
                isStatic : true,
                render :{
                    fillStyle : 'red'
                }
            }
        );
        World.add(world, wall);
    });
});
  
//creating goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.8,
    unitLengthY * 0.8,
    {
        label : 'goal',
        isStatic : true,
        render :{
            fillStyle : 'green'
        }
    }
);
World.add(world, goal);

//creating ball
const radius = Math.min(unitLengthX, unitLengthY) / 3;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    radius,
    {
        label : 'ball',
        render :{
            fillStyle : 'yellow'
        }
    }
);
World.add(world, ball);

document.addEventListener('keyup', (event) => {
    const {x, y} = ball.velocity;
    if(event.code === "ArrowRight"){
        Body.setVelocity(ball, {x : x + 5, y});
    }
    if(event.code === "ArrowLeft"){
        Body.setVelocity(ball, {x : x - 5, y})
    }
    if(event.code === "ArrowUp"){
        Body.setVelocity(ball, {x, y : y - 5})
    }
    if(event.code === "ArrowDown"){
        Body.setVelocity(ball, {x, y : y + 10})
    }
});

//winning condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach( (collision) => {
        const labels = ['ball', 'goal'];

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach( (body) => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })
        }
    })
})