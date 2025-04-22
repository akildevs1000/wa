const { exec } = require('child_process');

const IGNORED_PROCESSES = ['pm2-client-connector', 'unused-whatsapp-client'];

exec('pm2 jlist', (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message });
    if (stderr) return res.status(500).json({ error: stderr });

    try {
        const processes = JSON.parse(stdout);
        const stoppedProcesses = processes.filter(
            proc => proc.pm2_env.status === 'stopped' && !IGNORED_PROCESSES.includes(proc.name)
        );
        console.log(stoppedProcesses.map(proc => ({ id: proc.pm_id, name: proc.name, status: proc.pm2_env.status })));

    } catch (parseError) {
        console.log({ error: "Error parsing PM2 JSON output" });
    }
});