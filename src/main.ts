import TextureAsset from "shaku/lib/assets/texture_asset";
import BlendModes from "shaku/lib/gfx/blend_modes";
import Sprite from "shaku/lib/gfx/sprite";
import { MouseButtons } from "shaku/lib/input";
import shaku from "shaku/lib/shaku";
import Shaku from "shaku/lib/shaku";
import { Color, Rectangle } from "shaku/lib/utils";
import Vector2 from "shaku/lib/utils/vector2";

interface Player {
    pos: Vector2;
    dir: Vector2;
    age: number;
}

function copyPlayer(player: Player): Player {
    return {
        pos: player.pos.clone(),
        dir: player.dir.clone(),
        age: player.age,
    }
}

// strictly game logic, could be fed to a solver for example
interface GameState {
    spawner: Vector2,
    turn: number,
    crates: Vector2[];
    players: Player[];
}

// includes animation logic, etc; 
interface DeltaState {
    prev: GameState,
    next: GameState,
    intermediate_states: GameState[], // includes prev and next
}

// a solver should get a GameState -> GameState function,
// but the actual game should get a DeltaState -> DeltaState;
// how to avoid code duplication??

// another option: GameState includes anim info on how it got here

enum TAPE_SYMBOL {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    NONE,
}

let walls = makeRectArray(20, 20, false);
walls[4][4] = true;
walls[2][5] = true;
walls[5][7] = true;
walls[11][9] = true;

/*let player_spawn: Player = {
    pos: new Vector2(8, 8),
    dir: Vector2.right,
    age: 0,
}*/

let miniturn_duration = .05;

let robot_delay = 2;

// instructions for the robot(s)
let robot_tape: TAPE_SYMBOL[] = [];

let selected_tape_pos = 0;

let cur_turn = 0;
let time_offset = 0;

let initial_state: GameState = singleStep({
    turn: 0,
    spawner: new Vector2(8, 8),
    players: [/*{
        pos: new Vector2(9, 8),
        dir: Vector2.right,
        age: 0,
    }*/], // oldest first
    crates: [
        new Vector2(1, 3),
        new Vector2(6, 2),
        new Vector2(3, 8),
    ]
})[0];

let [all_states, all_deltas] = gameLogic(initial_state, robot_tape);

function gameLogic(initial_state: GameState, robot_tape: TAPE_SYMBOL[]): [GameState[], DeltaState[]] {
    let res_all_states: GameState[] = [initial_state];
    let res_all_deltas: DeltaState[] = [];
    let cur_state = initial_state;
    for (let k = 0; k < robot_tape.length; k++) {
        let [new_state, new_delta] = singleStep(cur_state);
        res_all_deltas.push(new_delta);
        res_all_states.push(new_state);
        cur_state = new_state;
    }
    return [res_all_states, res_all_deltas];
}

function singleStep(state: GameState): [GameState, DeltaState] {
    let new_state = copyState(state);
    let intermediate_states = [copyState(new_state)];
    for (let k = 0; k < new_state.players.length; k++) {
        let action = robot_tape[new_state.players[k].age];
        let direction = selectFromEnum([
            [TAPE_SYMBOL.LEFT, Vector2.left],
            [TAPE_SYMBOL.RIGHT, Vector2.right],
            [TAPE_SYMBOL.UP, Vector2.up],
            [TAPE_SYMBOL.DOWN, Vector2.down],
        ], action)
        if (direction !== null) {
            moveThing(new_state, new_state.players[k].pos, direction);
            new_state.players[k].dir = direction;
            intermediate_states.push(copyState(new_state));
        } else {
            intermediate_states.push(copyState(new_state));
        }
        new_state.players[k].age += 1;
    }
    if (new_state.turn % robot_delay === 0) {
        if (moveThing(new_state, new_state.spawner.add(Vector2.right), Vector2.right)) {
            new_state.players.push({
                pos: new_state.spawner.add(Vector2.right),
                dir: Vector2.right,
                age: 0,
            });
            intermediate_states.push(copyState(new_state));
        }
    }
    new_state.turn += 1;

    return [new_state, {
        prev: state,
        next: new_state,
        intermediate_states: intermediate_states
    }]
}

// recursive
function moveThing(new_state: GameState, pos: Vector2, direction: Vector2): boolean {
    let new_pos = pos.add(direction);
    let crate_to_move_index = indexOfTrue(new_state.crates, (crate) => crate.equals(pos));
    let player_to_move_index = indexOfTrue(new_state.players, (player) => player.pos.equals(pos));
    let spawner_to_move = new_state.spawner.equals(pos);
    if (!validPos(pos)) return false;
    if (crate_to_move_index === -1 && player_to_move_index === -1 && !spawner_to_move) return true;
    if (!validPos(new_pos)) return false;
    if (moveThing(new_state, new_pos, direction)) {
        if (crate_to_move_index !== -1) {
            new_state.crates[crate_to_move_index].addSelf(direction);
        }
        if (player_to_move_index !== -1) {
            new_state.players[player_to_move_index].pos.addSelf(direction);
        }
        if (spawner_to_move) {
            new_state.spawner.addSelf(direction);
        }
        return true
    } else {
        return false
    }
}

function validPos(coords: Vector2) {
    return coords.x >= 0 && coords.x < walls[0].length
        && coords.y >= 0 && coords.y < walls.length
        && !walls[coords.y][coords.x];
}

function copyState(state: GameState): GameState {
    return {
        turn: state.turn,
        spawner: state.spawner.clone(),
        players: state.players.map(copyPlayer),
        crates: state.crates.map(x => x.clone()),
    }
}

function drawGameState(state: GameState) {
    forEachTile(walls, (isWall, i, j) => {
        if (isWall) {
            wall_sprite.position.set((i + 1) * TILE_SIZE, (j + 1) * TILE_SIZE);
            Shaku.gfx!.drawSprite(wall_sprite);
        }
    });
    state.crates.forEach(crate => {
        crate_sprite.position.set((crate.x + 1) * TILE_SIZE, (crate.y + 1) * TILE_SIZE);
        Shaku.gfx!.drawSprite(crate_sprite);
    });
    let brightColor = new Color(1.5, 1.5, 1.5, 1);
    state.players.forEach((player, index) => {
        player_sprite.position.set((player.pos.x + 1) * TILE_SIZE, (player.pos.y + 1) * TILE_SIZE);
        player_sprite.rotation = player.dir.getRadians() + Math.PI / 2;
        player_sprite.color = (index === 0) ? brightColor : Shaku.utils.Color.white;
        Shaku.gfx!.drawSprite(player_sprite);
    });
    Shaku.gfx!.outlineRect(
        new Rectangle(
            (state.spawner.x + .5) * TILE_SIZE,
            (state.spawner.y + .5) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        ),
        Shaku.utils.Color.white,
        null, 0
    )
}

function drawGameStateLerp(stateA: GameState, stateB: GameState, t: number) {
    forEachTile(walls, (isWall, i, j) => {
        if (isWall) {
            wall_sprite.position.set((i + 1) * TILE_SIZE, (j + 1) * TILE_SIZE);
            Shaku.gfx!.drawSprite(wall_sprite);
        }
    });
    for (let k = 0; k < stateA.crates.length; k++) {
        const crateA = stateA.crates[k];
        const crateB = stateB.crates[k];
        crate_sprite.position.copy(Vector2.lerp(crateA, crateB, t).add(1, 1).mul(TILE_SIZE));
        Shaku.gfx!.drawSprite(crate_sprite);
    }

    let brightColor = new Color(1.5, 1.5, 1.5, 1);
    for (let k = 0; k < stateA.players.length; k++) {
        const playerA = stateA.players[k];
        const playerB = stateB.players[k];
        player_sprite.position.copy(Vector2.lerp(playerA.pos, playerB.pos, t).add(1, 1).mul(TILE_SIZE));
        player_sprite.rotation = playerB.dir.getRadians() + Math.PI / 2;
        player_sprite.color = (k === 0) ? brightColor : Shaku.utils.Color.white;
        Shaku.gfx!.drawSprite(player_sprite);
    }

    if (stateA.players.length < stateB.players.length) {
        let new_player = stateB.players[stateB.players.length - 1];
        player_sprite.position.copy(Vector2.lerp(stateA.spawner, new_player.pos, t).add(1, 1).mul(TILE_SIZE));
        player_sprite.rotation = new_player.dir.getRadians() + Math.PI / 2;
        Shaku.gfx!.drawSprite(player_sprite);
    }

    let lerp_spawner = Vector2.lerp(stateA.spawner, stateB.spawner, t)
    Shaku.gfx!.outlineRect(
        new Rectangle(
            (lerp_spawner.x + .5) * TILE_SIZE,
            (lerp_spawner.y + .5) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        ),
        Shaku.utils.Color.white,
        null, 0
    )
}

// t in 0..1
function drawDeltaState(delta: DeltaState, t: number) {
    // drawGameState(delta.prev);
    if (t >= 1) {
        console.log("11111")
    }
    t *= (delta.intermediate_states.length - 1);
    let turn = Math.floor(t);
    drawGameStateLerp(delta.intermediate_states[turn], delta.intermediate_states[turn + 1], t % 1);
    // drawGameStateLerp(delta.prev, delta.next, t);
}

function drawSymbol(symbol: TAPE_SYMBOL, pos: Vector2) {
    switch (symbol) {
        case TAPE_SYMBOL.LEFT:
            left_arrow.rotation = 0;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.UP:
            left_arrow.rotation = Math.PI * 0.5;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.RIGHT:
            left_arrow.rotation = Math.PI;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.DOWN:
            left_arrow.rotation = Math.PI * 1.5;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.NONE:
            none_sprite.position.copy(pos);
            Shaku.gfx?.drawSprite(none_sprite);
            break;
        default:
            break;
    }
}

const TILE_SIZE = 30;

// function

// async function runGame() {
// init shaku
Shaku!.input!.setTargetElement(() => Shaku.gfx!.canvas);
await Shaku.init(null);

// add shaku's canvas to document and set resolution to 800x600
document.body.appendChild(Shaku!.gfx!.canvas);
Shaku.gfx!.setResolution(800, 600, true);
Shaku.gfx!.centerCanvas();
// Shaku.gfx!.maximizeCanvasSize(false, false);

// TODO: INIT STUFF AND LOAD ASSETS HERE
// let soundAsset = await Shaku.assets.loadSound('../sounds/example_sound.wav');
// let soundInstance = Shaku.sfx!.createSound(soundAsset);

// let texture = await Shaku.assets.loadTexture('../imgs/example_image.png', null);
// let sprite = new Shaku.gfx!.Sprite(texture, null);
// sprite.position.set(Shaku.gfx!.canvas.width / 2, Shaku.gfx!.canvas.height / 2);

const player_sprite = await makeAsciiSprite(`
        .000.
        .111.
        22222
        .333.
        .3.3.
    `, [
    Shaku.utils.Color.black,
    Shaku.utils.Color.orange,
    Shaku.utils.Color.white,
    Shaku.utils.Color.blue
]);

const wall_sprite = await makeAsciiSprite(`
        00010
        11111
        01000
        11111
        00010
    `, [
    Shaku.utils.Color.brown,
    Shaku.utils.Color.darkgray,
]);

const crate_sprite = await makeAsciiSprite(`
        00000
        0...0
        0...0
        0...0
        00000
    `, [
    Shaku.utils.Color.orange,
]);

const left_arrow = await makeAsciiSprite(`
        ..0..
        .0...
        0.000
        .0...
        ..0..
    `, [
    Shaku.utils.Color.orange,
]);

const none_sprite = await makeAsciiSprite(`
        .....
        .000.
        .0.0.
        .000.
        .....
    `, [
    Shaku.utils.Color.orange,
]);

// do a single main loop step and request the next step
function update() {
    // start a new frame and clear screen
    Shaku.startFrame();
    Shaku.gfx!.clear(Shaku.utils.Color.cornflowerblue);

    // TODO: PUT YOUR GAME UPDATES / RENDERING HERE

    // player_sprite.position.set((Math.sin(Shaku.gameTime.elapsed) + 1) * Shaku.gfx!.canvas.width * .5, 60);
    // Shaku.gfx!.drawSprite(player_sprite);

    if (Shaku.input?.pressed(["left", "q"]) && selected_tape_pos > 0) {
        selected_tape_pos -= 1;
    } else if (Shaku.input?.pressed(["right", "e"]) && selected_tape_pos < robot_tape.length) {
        selected_tape_pos += 1;
    }
    if (Shaku.input?.pressed(["r"])) {
        selected_tape_pos = 0;
    }



    /*if (Shaku.input?.pressed("up")) {
        cur_turn = Math.max(cur_turn - 1, 0);
    } else if (Shaku.input?.pressed("down")) {
        cur_turn = Math.min(cur_turn + 1, robot_tape.length);
    }*/
    if (cur_turn !== selected_tape_pos && time_offset === 0) {
        let dir = Math.sign(selected_tape_pos - cur_turn)
        cur_turn += dir;
        time_offset -= dir * .99;
    }
    // cur_turn = selected_tape_pos;

    let input_symbol = selectFromInput([
        ["w", TAPE_SYMBOL.UP],
        ["s", TAPE_SYMBOL.DOWN],
        ["d", TAPE_SYMBOL.RIGHT],
        ["a", TAPE_SYMBOL.LEFT],
        ["space", TAPE_SYMBOL.NONE],
    ])
    if (input_symbol !== null) {
        if (selected_tape_pos >= robot_tape.length) {
            // add to the end
            robot_tape.push(input_symbol)
        } else {
            robot_tape[selected_tape_pos] = input_symbol;
        }
        selected_tape_pos += 1;
        [all_states, all_deltas] = gameLogic(initial_state, robot_tape);
    }

    // editor 
    let mouse_tile = Shaku.input!.mousePosition.div(TILE_SIZE).round().sub(1, 1);
    Shaku.gfx!.outlineRect(
        new Rectangle(
            (mouse_tile.x + .5) * TILE_SIZE,
            (mouse_tile.y + .5) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        ),
        Shaku.utils.Color.white,
        null, 0
    )
    if (Shaku.input?.mousePressed(MouseButtons.left)) {
        walls[mouse_tile.y][mouse_tile.x] = !walls[mouse_tile.y][mouse_tile.x];
        [all_states, all_deltas] = gameLogic(initial_state, robot_tape);
    }
    if (Shaku.input?.mousePressed(MouseButtons.right)) {
        let crate_index = indexOfTrue(initial_state.crates, c => c.equals(mouse_tile));
        if (crate_index === -1) {
            initial_state.crates.push(mouse_tile);
        } else {
            initial_state.crates.splice(crate_index, 1)
        }
        [all_states, all_deltas] = gameLogic(initial_state, robot_tape);
    }
    if (Shaku.input?.mouseWheelSign !== 0) {
        robot_delay += Shaku.input?.mouseWheelSign;
        robot_delay = Math.max(1, robot_delay);
        [all_states, all_deltas] = gameLogic(initial_state, robot_tape);
    }


    if (time_offset > 0) {
        drawDeltaState(all_deltas[cur_turn], time_offset);
        time_offset = Math.max(0, time_offset - Shaku.gameTime.delta! / (miniturn_duration * all_deltas[cur_turn].intermediate_states.length))
    } else if (time_offset < 0) {
        drawDeltaState(all_deltas[cur_turn - 1], 1 + time_offset);
        time_offset = Math.min(0, time_offset + Shaku.gameTime.delta! / (miniturn_duration * all_deltas[cur_turn - 1].intermediate_states.length))
    } else {
        drawGameState(all_states[cur_turn]);
    }


    for (let k = 0; k < robot_tape.length; k++) {
        let cur_symbol = robot_tape[k];
        drawSymbol(cur_symbol, new Vector2((k + 1) * TILE_SIZE, shaku.gfx?.canvas.height - TILE_SIZE));
    }
    Shaku.gfx?.outlineRect(
        new Rectangle((selected_tape_pos + .5) * TILE_SIZE, shaku.gfx?.canvas.height - TILE_SIZE * 1.5, TILE_SIZE, TILE_SIZE),
        Shaku.utils.Color.red,
        null, 0
    )


    // end frame and request next step
    Shaku.endFrame();
    Shaku.requestAnimationFrame(update);
}

// start main loop
update();
// };

// runGame();


async function makeAsciiSprite(ascii: string, colors: (string | Shaku.utils.Color)[]): Promise<Sprite> {
    let texture = await loadAsciiTexture(ascii, colors);
    let result_sprite = new Shaku.gfx!.Sprite(texture, null);
    result_sprite.size.set(TILE_SIZE, TILE_SIZE)
    return result_sprite;
}


async function loadAsciiTexture(ascii: string, colors: (string | Shaku.utils.Color)[]): Promise<TextureAsset> {

    let rows = ascii.trim().split("\n").map(x => x.trim())
    let height = rows.length
    let width = rows[0].length

    // create render target
    let renderTarget = await Shaku.assets.createRenderTarget(null, width, height, 4);

    // use render target
    Shaku.gfx!.setRenderTarget(renderTarget, false);

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            let val = rows[j][i];
            if (val === '.' || val === ' ') continue;
            let n = parseInt(val);

            let col = colors[n];
            if (typeof col === 'string') {
                col = Shaku.utils.Color.fromHex(col);
            }
            Shaku.gfx!.fillRect(
                new Shaku.utils.Rectangle(i, height - j - 1, 1, 1),
                col,
                BlendModes.Opaque, 0
            );
        }
    }

    // reset render target
    Shaku.gfx!.setRenderTarget(null, false);

    return renderTarget;
}

function makeRectArray<T>(width: number, height: number, fill: T): T[][] {
    let result: T[][] = [];
    for (let j = 0; j < height; j++) {
        let cur_row: T[] = [];
        for (let i = 0; i < width; i++) {
            cur_row.push(fill);
        }
        result.push(cur_row);
    }
    return result;
}

function forEachTile<T>(map: T[][], func: (tile: T, i: number, j: number) => void) {
    for (let j = 0; j < map.length; j++) {
        let cur_row = map[j];
        for (let i = 0; i < map[0].length; i++) {
            func(cur_row[i], i, j);
        }
    }
}

function selectFromEnum<A, B>(options: [A, B][], value: A): B | null {
    for (const [option, result] of options) {
        if (option === value) {
            return result;
        }
    }
    return null;
}

function selectFromInput<T>(options: [string, T][]): T | null {
    for (const [key, result] of options) {
        if (Shaku.input?.pressed(key)) {
            return result;
        }
    }
    return null;
}

function indexOfTrue<T>(array: T[], fn: (x: T) => boolean): number {
    for (let k = 0; k < array.length; k++) {
        if (fn(array[k])) {
            return k
        }
    }
    return -1;
}