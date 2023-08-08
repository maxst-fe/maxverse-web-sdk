declare module 'shared-worker:*' {
  const WorkerFactory: new () => SharedWorker;
  export default WorkerFactory;
}
