var timeLastCalled = 0;
var roundTime = 0;
var bestTime = 0;
var player;
var restartButton;
// var enemy;
var entities;
var enemySpawner;
var dashSound;
var WIDTH = 900;
var HEIGHT = 600;
var dashSound = new Audio("dash.wav");
var music = new Audio("washing.mp3");
music.loop = true;
var db = firebase.firestore();
var addedScore;
var shouldShowLeaderboard;
var playerScores;

function getScore() {
	return roundTime;
}

function resetGame() {
	enemySpawner = new EnemySpawner(2, 150);
    player = new PLayer(new p5.Vector(200,200,0), new p5.Vector(0,0,0), new p5.Vector(0,0,0),50,.2);
    restartButton.hide();
	entities = [player];
	timeLastCalled = millis();
	player.spawnGranter();
	roundTime = 0;
	addedScore = false;
	shouldShowLeaderboard = false;
}

function preload()
{
    // soundFormats('wav');
    // dashSound = loadSound('dash.wav');
}

function setup() {
	createCanvas(WIDTH, HEIGHT);
    restartButton = createButton('RESTART');
    restartButton.position(WIDTH/2 -30,HEIGHT/2 -30);
    restartButton.mousePressed(restart);
	// enemy = new Enemy(createVector(-50, 100), createVector(200, 200), 166);
	resetGame();
}

function showLeaderboard() {
	var leadText = "LEADERBOARD\nYou are: " + PLayer.getName() + "\n";
	for (var i = 0; i < playerScores.length; i++)
	{
		leadText += "\n#" + (i + 1) + ": " + playerScores[i].name + ": " + playerScores[i].score.toPrecision(3);
	}
	text(leadText, 700, 200);
}

function draw() {
	music.play();
	var timeNow = millis();
	var dt = (timeNow - timeLastCalled) / 1000;
	// display round time if not dead
	if (!player.getIsDead())roundTime += dt;
	else 
	{
		restartButton.show();
	}
	// find high score
	if (roundTime > bestTime) bestTime = roundTime;
	timeLastCalled = timeNow;
	background(220);
	// display time and best time
	textSize(14);
	fill(0,0,0);
	text('TIME',WIDTH/2 - 80,20);
	text(roundTime.toPrecision(3), WIDTH/2 - 40, 20);
	text('BEST TIME',WIDTH/2 +10,20);
	text(bestTime.toPrecision(3), WIDTH/2 +90, 20);

	
	if (shouldShowLeaderboard)
	{
		showLeaderboard();
	}

	enemySpawner.update(entities, player, roundTime);
	for (var i = 0; i < entities.length; i++)
	{
		entities[i].update(dt);
		entities[i].draw();
	}
	for (var i = 0; i < entities.length; i++)
	{
		if (entities[i].shouldDelete)
		{
			entities.splice(i, 1);
			i--;
		}
	}
}

function restart()
{
    resetGame();
}