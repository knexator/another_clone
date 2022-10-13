import Shaku from "shaku/lib/shaku";
import TextureAsset from "shaku/lib/assets/texture_asset";
import Sprite from "shaku/lib/gfx/sprite";
import Vector2 from "shaku/lib/utils/vector2";
import Color from "shaku/lib/utils/color";
import Rectangle from "shaku/lib/utils/rectangle";
import { KeyboardKeys, MouseButtons } from "shaku/lib/input/key_codes";
import { BlendModes } from "shaku/lib/gfx/blend_modes";

Shaku!.input!.setTargetElement(() => Shaku.gfx!.canvas);
await Shaku.init();

// add shaku's canvas to document and set resolution to 800x600
document.body.appendChild(Shaku!.gfx!.canvas);
Shaku.gfx!.setResolution(800, 600, true);
Shaku.gfx!.centerCanvas();
// Shaku.gfx!.maximizeCanvasSize(false, false);

const TILE_SIZE = 30;

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

const target_sprite = await makeAsciiSprite(`
        .....
        .000.
        .0.0.
        .000.
        .....
    `, [
    Shaku.utils.Color.darkblue,
]);

const spawner_sprite = await makeAsciiSprite(`
        .0000
        0000.
        000..
        0000.
        .0000
    `, [
    Shaku.utils.Color.darkblue,
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

class GameState {
    public spawned_player: boolean;
    constructor(
        public major_turn: number,
        public minor_turn: number,
        public things: GameObject[],
    ) {
        this.spawned_player = false;
    }

    draw(turn_time: number) {
        this.things.forEach(x => x.draw(turn_time));
    }

    public get wall(): Walls {
        let res = this.things.filter(x => x instanceof Walls);
        if (res.length === 0) throw new Error("no walls!");
        if (res.length > 1) throw new Error("too many walls!");
        return res[0] as Walls;
    }

    public get spawner(): Spawner {
        let res = this.things.filter(x => x instanceof Spawner);
        if (res.length === 0) throw new Error("no Spawner!");
        if (res.length > 1) throw new Error("too many Spawner!");
        return res[0] as Spawner;
    }

    public get players(): Player[] {
        return this.things.filter(x => x instanceof Player) as Player[];
    }

    nextState(): GameState {
        let players = this.players;

        if (this.minor_turn < players.length) {
            // move player of index minor_turn
            let new_state = new GameState(this.major_turn, this.minor_turn + 1, this.things.map(x => x.clone()));
            let new_player = new_state.players[this.minor_turn];
            if (new_player.index !== this.minor_turn) {
                console.log("new_state.players:", new_state.players);
                console.log("new_player.index:", new_player.index);
                console.log("this.minor_turn:", this.minor_turn);
                throw new Error("new_player index is wrong! time to use the other way");
            }
            let action = robot_tape[new_player.age];
            let direction = selectFromEnum([
                [TAPE_SYMBOL.LEFT, Vector2.left],
                [TAPE_SYMBOL.RIGHT, Vector2.right],
                [TAPE_SYMBOL.UP, Vector2.up],
                [TAPE_SYMBOL.DOWN, Vector2.down],
            ], action)
            if (direction !== null) {
                new_state.move(new_player.pos, direction);
                new_player.dir = direction;
            }
            new_player.age += 1;
            return new_state;
        } else if (!this.spawned_player && (this.major_turn + 1) % robot_delay === 0) {
            // spawn a new player
            let new_state = new GameState(this.major_turn, this.minor_turn + 1, this.things.map(x => x.clone()));
            let spawn_dir = new_state.spawner.dir;
            let spawn_pos = new_state.spawner.pos.add(spawn_dir);
            if (new_state.move(spawn_pos, spawn_dir)) {
                new_state.things.push(new Player(
                    spawn_pos,
                    spawn_dir.clone(),
                    new_state.minor_turn - 1,
                    0,
                    new_state.spawner as Player // hacky
                ));
            }
            new_state.spawned_player = true;
            return new_state;
        } else {
            let new_state = new GameState(this.major_turn + 1, 0, this.things.map(x => x.clone()));
            return new_state;
        }

        /*if (this.minor_turn === 2) {
            let new_state = new GameState(this.major_turn + 1, 0, this.things.map(x => x.clone()));
            return new_state;
        } else {
            console.log("this minor turn", this.minor_turn);
            let new_state = new GameState(this.major_turn, this.minor_turn + 1, this.things.map(x => x.clone()));
            new_state.move((new_state.things[1] as Player).pos, Vector2.up);
            return new_state;
        }*/
    }

    move(pos: Vector2, dir: Vector2): boolean {
        return this.things.every(x => x.move(this, pos, dir));
    }
}

/*
function singleStep(state: GameState): GameState {
    let new_state = copyState(state);
    let intermediate_states = [copyState(new_state)];
    let floor_had_something_above = new_state.singleUseFloors.map(floor => {
        if (floor.used) return false;
        return new_state.crates.some(crate => crate.equals(floor.pos))
            || new_state.players.some(player => player.pos.equals(floor.pos))
            || new_state.spawner.equals(floor.pos);
    });
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
        }
        if (FLOORS_UPDATE_EVERY_STEP) {
            new_state.singleUseFloors.forEach((floor, i) => {
                if (floor_had_something_above[i]) {
                    if (!new_state.crates.some(crate => crate.equals(floor.pos))
                        && !new_state.players.some(player => player.pos.equals(floor.pos))
                        && !new_state.spawner.equals(floor.pos)) {
                        floor.used = true;
                    }
                }
            });

            floor_had_something_above = new_state.singleUseFloors.map(floor => {
                if (floor.used) return false;
                return new_state.crates.some(crate => crate.equals(floor.pos))
                    || new_state.players.some(player => player.pos.equals(floor.pos))
                    || new_state.spawner.equals(floor.pos);
            });
        }
        intermediate_states.push(copyState(new_state));
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

    new_state.singleUseFloors.forEach((floor, i) => {
        if (floor_had_something_above[i]) {
            if (!new_state.crates.some(crate => crate.equals(floor.pos))
                && !new_state.players.some(player => player.pos.equals(floor.pos))
                && !new_state.spawner.equals(floor.pos)) {
                floor.used = true;
            }
        }
    });

    new_state.turn += 1;

    return [new_state, {
        prev: state,
        next: new_state,
        intermediate_states: intermediate_states
    }]
}
*/

abstract class GameObject {
    public abstract previous: GameObject | null;
    /** turn time goes between 0 (previous turn) and 1 (current turn) */
    abstract draw(turn_time: number): void;
    /** return true if this object has no issue with whatever is at pos being moved in direction */
    abstract move(state: GameState, pos: Vector2, direction: Vector2): boolean;
    abstract clone(): GameObject;
}


class Walls extends GameObject {
    public previous = null;
    public data: boolean[][];
    // todo: all
    constructor(
        public w: number,
        public h: number,
    ) {
        super();
        this.data = makeRectArray(20, 20, false);
    }
    draw(turn_time: number): void {
        forEachTile(this.data, (isWall, i, j) => {
            if (isWall) {
                wall_sprite.position.set((i + 1) * TILE_SIZE, (j + 1) * TILE_SIZE);
                Shaku.gfx!.drawSprite(wall_sprite);
            }
        });
    }
    move(state: GameState, pos: Vector2, direction: Vector2): boolean {
        if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h) return false;
        if (this.data[pos.y][pos.x]) return false;
        return true;
    }
    clone(): Walls {
        return this;
    }
    toggleAt(pos: Vector2) {
        if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h) return;
        this.data[pos.y][pos.x] = !this.data[pos.y][pos.x];
    }
}

abstract class Pushable extends GameObject {
    public abstract sprite: Sprite;
    constructor(
        public pos: Vector2,
        public previous: Pushable | null,
    ) {
        super();
    };

    draw(turn_time: number) {
        if (turn_time !== 1 && this.previous) {
            this.sprite.position.copy(Vector2.lerp(this.previous.pos, this.pos, turn_time).add(1, 1).mul(TILE_SIZE));
        } else {
            this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
        }
        Shaku.gfx!.drawSprite(this.sprite);
    }

    // recursive
    move(state: GameState, pos: Vector2, dir: Vector2): boolean {
        if (!pos.equals(this.pos)) return true;
        let new_pos = pos.add(dir);
        if (state.move(new_pos, dir)) {
            this.pos.copy(new_pos);
            return true;
        }
        return false;
    }
}

class Spawner extends Pushable {
    sprite = spawner_sprite;
    constructor(
        public pos: Vector2,
        public dir: Vector2,
        public previous: Spawner | null,
    ) {
        super(pos, previous);
        this.sprite.rotation = this.dir.getRadians();
    };

    clone(): GameObject {
        return new Spawner(this.pos.clone(), this.dir.clone(), this);
    }
}

class Crate extends Pushable {
    sprite = crate_sprite;
    clone(): Crate {
        return new Crate(this.pos.clone(), this);
    }
}

class Player extends Pushable {
    sprite = player_sprite;
    constructor(
        public pos: Vector2,
        public dir: Vector2,
        public index: number,
        public age: number = 0,
        public previous: Player | null,
    ) { super(pos, previous); };

    private static _brightColor = new Color(1.5, 1.5, 1.5, 1);
    draw(turn_time: number): void {
        this.sprite.rotation = this.dir.getRadians() + Math.PI / 2;
        this.sprite.color = (this.index === 0) ? Player._brightColor : Shaku.utils.Color.white;
        super.draw(turn_time);
    }

    clone(): GameObject {
        return new Player(this.pos.clone(), this.dir.clone(), this.index, this.age, this);
    }
}

enum TAPE_SYMBOL {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    NONE,
}

let miniturn_duration = .05;

let robot_delay = 5;

// instructions for the robot(s)
let robot_tape: TAPE_SYMBOL[] = [];

let selected_tape_pos = 0;

let cur_turn = 0;
let time_offset = 0;

let initial_state = new GameState(
    -1, 0,
    [
        new Walls(20, 20),
        new Spawner(new Vector2(6, 6), Vector2.right, null),
        // new Player(new Vector2(8, 8), Vector2.right, 0, 0, null),
        new Crate(new Vector2(1, 3), null),
        new Crate(new Vector2(6, 2), null),
    ],
)
while (initial_state.major_turn < 0) {
    initial_state = initial_state.nextState();
}
console.log(initial_state);
// initial_state.[4][4] = true;

let all_states = gameLogic(initial_state, robot_tape);

function gameLogic(initial_state: GameState, robot_tape: TAPE_SYMBOL[]): GameState[] {
    let res_all_states: GameState[] = [initial_state];
    let cur_state = initial_state;
    for (let k = 0; k < robot_tape.length; k++) {
        while (true) {
            let new_state = cur_state.nextState();
            res_all_states.push(new_state);
            cur_state = new_state;
            if (cur_state.major_turn !== k) break;
        }
    }
    if (cur_turn > res_all_states.length) {
        cur_turn = 0;
    }
    return res_all_states;
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

    if ((all_states[cur_turn].major_turn !== selected_tape_pos || all_states[cur_turn].minor_turn !== 0) && time_offset === 0) {
        let dir = Math.sign(selected_tape_pos - all_states[cur_turn].major_turn - .5); // -.5 is for minor_turn !== 0
        cur_turn += dir;
        time_offset -= dir * .99;
    }

    if (Shaku.input?.pressed(["t"])) {
        console.log("cur_turn: ", cur_turn);
        console.log("selected_tape_pos: ", selected_tape_pos);
        console.log("all states: ", all_states);
    }

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
        all_states = gameLogic(initial_state, robot_tape);
    }

    // todo: editor
    let mouse_tile = Shaku.input!.mousePosition.div(TILE_SIZE).round().sub(1, 1);
    Shaku.gfx!.outlineRect(
        new Rectangle(
            (mouse_tile.x + .5) * TILE_SIZE,
            (mouse_tile.y + .5) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        ),
        Shaku.utils.Color.white
    )
    if (Shaku.input?.mousePressed(MouseButtons.left)) {
        initial_state.wall.toggleAt(mouse_tile);
        all_states = gameLogic(initial_state, robot_tape);
    }
    if (Shaku.input?.mousePressed(MouseButtons.right)) {
        let crate_index = indexOfTrue(initial_state.things, c => (c instanceof Crate && c.pos.equals(mouse_tile)));
        if (crate_index === -1) {
            initial_state.things.push(new Crate(mouse_tile, null));
        } else {
            initial_state.things.splice(crate_index, 1)
        }
        all_states = gameLogic(initial_state, robot_tape);
    }
    if (Shaku.input?.mouseWheelSign !== 0) {
        robot_delay += Shaku.input?.mouseWheelSign;
        robot_delay = Math.max(1, robot_delay);
        all_states = gameLogic(initial_state, robot_tape);
    }
    /*if (Shaku.input!.keyPressed(KeyboardKeys.n1)) {
        if (initial_state.singleUseFloors.some(f => f.pos.equals(mouse_tile))) {
            initial_state.singleUseFloors = initial_state.singleUseFloors.filter(f => !f.pos.equals(mouse_tile));
        } else {
            initial_state.singleUseFloors.push({
                pos: mouse_tile,
                used: false,
            })
        }
        [all_states, all_deltas] = gameLogic(initial_state, robot_tape);
    }*/


    if (time_offset < 0) { // going forwards in time
        all_states[cur_turn].draw(time_offset + 1);
    } else if (time_offset > 0) { // going backwards in time
        all_states[cur_turn + 1].draw(time_offset);
    } else {
        all_states[cur_turn].draw(1);
    }
    time_offset = moveTowards(time_offset, 0, Shaku.gameTime.delta! * (Math.abs(all_states[cur_turn].major_turn - selected_tape_pos) + 1) / miniturn_duration);

    Shaku.gfx?.fillRect(
        new Rectangle((robot_delay + .5) * TILE_SIZE, Shaku.gfx!.canvas!.height - TILE_SIZE * 1.5, TILE_SIZE, TILE_SIZE),
        Shaku.utils.Color.blue
    )
    for (let k = 0; k < robot_tape.length; k++) {
        let cur_symbol = robot_tape[k];
        drawSymbol(cur_symbol, new Vector2((k + 1) * TILE_SIZE, Shaku.gfx?.canvas.height - TILE_SIZE));
    }
    Shaku.gfx?.outlineRect(
        new Rectangle((selected_tape_pos + .5) * TILE_SIZE, Shaku.gfx?.canvas.height - TILE_SIZE * 1.5, TILE_SIZE, TILE_SIZE),
        Shaku.utils.Color.red
    )


    // end frame and request next step
    Shaku.endFrame();
    Shaku.requestAnimationFrame(update);
}

// start main loop
update();
// };

// runGame();

function moveTowards(cur_val: number, target_val: number, max_delta: number): number {
    if (target_val > cur_val) {
        return Math.min(cur_val + max_delta, target_val);
    } else if (target_val < cur_val) {
        return Math.max(cur_val - max_delta, target_val);
    } else {
        return target_val;
    }
}

async function makeAsciiSprite(ascii: string, colors: (string | Color)[]): Promise<Sprite> {
    let texture = await loadAsciiTexture(ascii, colors);
    let result_sprite = new Shaku.gfx!.Sprite(texture);
    result_sprite.size.set(TILE_SIZE, TILE_SIZE)
    return result_sprite;
}


async function loadAsciiTexture(ascii: string, colors: (string | Color)[]): Promise<TextureAsset> {

    let rows = ascii.trim().split("\n").map(x => x.trim())
    let height = rows.length
    let width = rows[0].length

    // create render target
    // @ts-ignore
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
    // @ts-ignore
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