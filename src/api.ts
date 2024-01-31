const SERVER_URL = import.meta.env.VITE_SERVER_URL;
console.log('SERVER_URL', SERVER_URL);

export async function executeCommand(context: string, command: string, instructions: string | undefined, thread: string | null, wait: boolean) {
    const res = await fetch(`${SERVER_URL}command`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            thread,
            command,
            instructions,
            context
        })
    });
    if (res.status === 200) {
        const data = await res.json();
        if (data.run_id && wait) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    resolve(await getCommandStatus(data.run_id, data.thread, true));
                }, 5000);
            });
        }
        return data;
    }
    // return new Promise((resolve, reject) => {
    //     setTimeout(async () => {
    //         resolve(await getCommandStatus('run_nB7OmeYsR762oBIvjpi9mQcV', true));
    //     }, 5000);
    // });

}

export async function getCommandStatus(runId: string, thread: string, wait: boolean) : Promise<{data: any, thread: string, runId: string}>{
    const res = await fetch(`${SERVER_URL}command/${thread}/${runId}`);
    if (res.status === 200) {
        const data = await res.json();
        if (data.status === 'in_progress' && wait) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    resolve(await getCommandStatus(runId, thread, true));
                }, 5000);
            });
        }
        console.log(data);
        return {data, thread, runId};
    };
    return {data: null, thread, runId};
}