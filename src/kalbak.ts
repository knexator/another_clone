////////////////////////////////
//****************************//
// https://github.com/a327ex/www/blob/master/content/posts/lessons_second_game.md#local-code
// trigger:every(condition, action), which performs the action every time the condition goes from being false to true
interface PendingAction {
    condition: () => boolean,
    action: Function
}
let doOnceOnTrueList: PendingAction[] = [];
export function doOnceOnTrue(condition: () => boolean, action: () => any) {
    doOnceOnTrueList.push({
        condition: condition,
        action: action,
    })
}

let doEveryFrameUntilTrueList: (() => boolean)[] = [];
export function doEveryFrameUntilTrue(action: () => boolean) {
    doEveryFrameUntilTrueList.push(action);
}

export function kalbakUpdate() {
    for (var i = doOnceOnTrueList.length - 1; i >= 0; i--) {
        let pending = doOnceOnTrueList[i];
        if (pending.condition()) {
            doOnceOnTrueList.splice(i, 1);
            pending.action();
        }
    }

    for (var i = doEveryFrameUntilTrueList.length - 1; i >= 0; i--) {
        if (doEveryFrameUntilTrueList[i]()) {
            doEveryFrameUntilTrueList.splice(i, 1);
        }
    }
}


//****************************//
////////////////////////////////