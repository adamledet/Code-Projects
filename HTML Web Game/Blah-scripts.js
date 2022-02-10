//Attributes
//Window
let windowDiv;
const WINDOW_WIDTH = 720;
const WINDOW_HEIGHT = 500;

//Objects / Arrays
let player;
let objects = [];
let objColors = [];
let objectRadius = 35;

//Score
let score = 0;
let scoreDiv = document.createElement("div");
let scoreP = document.createElement("p");

//Loop Var
let gameOn = true;

//Bullet
const BULLET_RADIUS = 7;
const BULLET_COOLDOWN = 300;
let canShoot = true;
let bulletList = [];
let BULLET_SPEED = 6;

//Use this object's properties to check if the corresponding key is down right now.
const INPUTS = Object.seal({
    LEFT: false,
    RIGHT: false,
    SHOOT: false,
});

const KEY_CODES = Object.freeze({
    37: "LEFT",
    39: "RIGHT",
    65: "LEFT",
    68: "RIGHT",
    32: "SHOOT"
});

//Keydown / Keyup
window.onkeydown = function(e)
{
    if (KEY_CODES.hasOwnProperty(e.keyCode))
    {
        e.preventDefault();
        INPUTS[KEY_CODES[e.keyCode]] = true;
    }
}
window.onkeyup = function(e)
{
    if (KEY_CODES.hasOwnProperty(e.keyCode))
    {
        e.preventDefault();
        INPUTS[KEY_CODES[e.keyCode]] = false;
    }
}


//Main Game Loop
function mainLoop()
{
    update();
    requestAnimationFrame(mainLoop);
}


//OnLoad function
window.onload = function()
{
    windowDiv = document.querySelector("#window");
    windowDiv.style.width = WINDOW_WIDTH + "px";
    windowDiv.style.height = WINDOW_HEIGHT + "px";
    windowDiv.style.margin = "auto";
    windowDiv.style.position = "relative";
    windowDiv.style.overflow = "hidden";
    
    //Score Div
    scoreDiv.appendChild(scoreP);
    scoreP.innerHTML = "Score: " + score;
    scoreDiv.style.left = "20px";
    scoreDiv.style.position = "absolute";
    scoreDiv.style.zIndex = "100";
    windowDiv.appendChild(scoreDiv);
    
    
    //Player object
    player = 
    {
        //*/
        xPos: (WINDOW_WIDTH / 2),
        div: document.querySelector("#ship"),
        yPos: WINDOW_HEIGHT - 70,
        lives: 3,
        velocity: 5,
        spritePath: "Capture.png"//Placeholder for actual player name
    }
    
    //player.yPos -= (player.div.clientHeight);
    
    //Colors Array
    objColors = ["#d00", "#3bd", "#d82", "#c28", "#999", "#8d3"];
    
    //Create Objs
    objects.push(createObject());
    objects.push(createObject());
    objects.push(createObject());
    objects.push(createObject());
    objects.push(createObject());
    
    
    // Begin main game loop
    requestAnimationFrame(mainLoop);
}


//Update Function
function update()
{
    if (gameOn)
    {
        //Player Position
        MoveInput(player);

        //Bullets, anyone?
        ShoootInput();

        moveALLtheBullets();

        //Check Player Collision for each Object in the array
        for(let i=0; i<objects.length; i++)
        {
            checkPlayerCollision(player, objects[i]);
        }
        
        checkALLtheBulletCollisions();

        //Object Movement
        for(let i=0; i< objects.length; i++)
        {
            moveObj(objects[i]);
        }

        //Constantly Update Score
        scoreP.innerHTML = "Lives: " + player.lives + "<br>Score: " + score;
    }
    else
    { 
        scoreP.style.color = "white";
        scoreP.innerHTML = "GAME OVER<br>Final Score: " + score;
        windowDiv.style.backgroundColor = "black";
    }
}

function setPosition(element)
{
    element.div.style.left = element.xPos + "px";
    element.div.style.top = element.yPos + "px";
}


//Pressing left or right arrows will move left or right
function MoveInput(movingBody)
{
    //Controlling Movement
    if(INPUTS.LEFT)//Move Left
    {
        if(movingBody.xPos > (0 + 5))
        {
            movingBody.xPos += -movingBody.velocity;
        }
    }
    if(INPUTS.RIGHT)//Move Right
    {
        if(movingBody.xPos <= (WINDOW_WIDTH - movingBody.div.clientWidth - 5))
        {
            movingBody.xPos += movingBody.velocity;
        }
    }
    setPosition(movingBody);
}


async function ShoootInput()
{
    if (INPUTS.SHOOT)
    {
        if(canShoot)
        {
            bulletList.push(createBullet(
                player.xPos + (player.div.clientWidth/2),
                player.yPos + (player.div.clientHeight/3)
            ));
            
            canShoot = false;
            await new Promise(resolve => setTimeout(resolve, BULLET_COOLDOWN));
            canShoot = true;
        }
    }
}


//Function create bullets!
function createBullet(xCenter, yCenter)
{
    let obj = {
        xPos: xCenter - BULLET_RADIUS,
        yPos: yCenter - BULLET_RADIUS,
        ySpeed: -BULLET_SPEED,
        div: document.createElement("div")
    }
    
    windowDiv.appendChild(obj.div);
    obj.div.style.width = (2 * BULLET_RADIUS) + "px";
    obj.div.style.height = (2 * BULLET_RADIUS) + "px"
    obj.div.style.backgroundColor = "green";
    obj.div.style.position = "absolute";
    obj.div.style.borderRadius = BULLET_RADIUS + "px";
    
    setPosition(obj);
    
    return obj;
}

//Function moves bullets upwards until the go offf-screeen, whereupon...
//Something happpens? Hopefullly?
function moveALLtheBullets(bulletObj)
{    
    for (let bullet of bulletList)
    {
        bullet.yPos += bullet.ySpeed;
    
        setPosition(bullet);

        if (bullet.yPos < -2*BULLET_RADIUS)
        {
            windowDiv.removeChild(bullet.div);
            bulletList.splice(bulletList.indexOf(bullet), 1);
            break;
        }
    }
}

function checkALLtheBulletCollisions()
{
    let disposableObjects = [];

    for(let object of objects)
    {
        let disposableBullets = [];
        
        for(let bullet of bulletList)
        {
            if (generalCollision(object, bullet))
            {
                score += 3;
                disposableBullets.push(bullet);
                disposableObjects.push(object);
            }
        }
        
        for (let bullet of disposableBullets)
        {
            windowDiv.removeChild(bullet.div);
            bulletList.splice(bulletList.indexOf(bullet), 1);
        }
    }

    for (let object of disposableObjects)
    {
        recreateObj(object);
    }
}


//Function creates objects
function createObject()
{
    let obj = {
        div: document.createElement("div")
    }
    
    windowDiv.appendChild(obj.div);
    obj.div.style.width = (2*objectRadius) + "px";
    obj.div.style.height = (2*objectRadius) + "px";
    obj.div.style.position = "absolute";
    
    recreateObj(obj);
    
    setPosition(obj);
    
    return obj;
}

//Function moves objects down until they fall off the screen. Then resets them above the window
function moveObj(object)
{
    object.xPos += object.xSpeed;
    object.yPos += object.ySpeed;
    
    //Reset Asteroids that Player Dodges
    if(object.yPos >= (WINDOW_HEIGHT * 3 / 2))
    {
        recreateObj(object);
    
        //Add score every time you dodge an object
        score += 5;
    }
    
    //Bounce Objs that hit X dimension walls
    if(((object.xPos + object.div.clientWidth) >= WINDOW_WIDTH) || (object.xPos <= 0))
    {
        object.xSpeed = -object.xSpeed;
    }
    setPosition(object);
}

//Recreate Obj
function recreateObj(object)
{
    object.xPos = Math.floor((Math.random()) * (WINDOW_WIDTH - object.div.clientWidth));
    object.yPos = (-Math.floor((Math.random()) * 100) - 100);
    object.xSpeed = (Math.floor((Math.random()) * 15) - 7);
    object.ySpeed = (Math.floor((Math.random()) * 4) + 3);
    object.div.style.borderRadius = Math.floor(Math.random() * 50) + "px";
    let randColor = Math.floor(Math.random() * objColors.length);
    object.div.style.backgroundColor = objColors[randColor];
}


//Check Player Collision (using AABB)
//o1 is player, and o2 is 
function checkPlayerCollision(p, o)
{
    if(generalCollision(p, o))
        
       {
           recreateObj(o);
           p.lives -= 1;
           if(p.lives <= 0)
           {
               gameOn = false;
           }
       }
}

function generalCollision(a, b)
{
    return (a.xPos < b.xPos + b.div.clientWidth &&
            a.xPos + a.div.clientWidth > b.xPos &&
            a.yPos < b.yPos + b.div.clientHeight &&
            a.yPos + a.div.clientHeight > b.yPos)
    //I'm sorrry I made you write this, Adam.
}