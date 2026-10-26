import {
  JobCollectionService,
  type CollectionServiceOptions,
} from './job-collection.service';

export interface SchedulerOptions
  extends CollectionServiceOptions {
  enabled: boolean;
  intervalHours: number;
}

export class JobCollectionScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly options: SchedulerOptions,
  ) {}

  start(): void {
    if (!this.options.enabled) {
      console.log(
        '[JobScheduler] Collection scheduler disabled.',
      );
      return;
    }

    if (this.timer) {
      return;
    }

    const intervalMs =
      this.options.intervalHours *
      60 *
      60 *
      1000;

    console.log(
      `[JobScheduler] Starting. Interval: ${this.options.intervalHours} hour(s).`,
    );

    this.timer = setInterval(() => {
      void this.runCollection();
    }, intervalMs);
  }

  stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;

    console.log(
      '[JobScheduler] Collection scheduler stopped.',
    );
  }

  async runCollection() {
    console.log(
      '[JobScheduler] Starting collection run...',
    );

    const service =
      new JobCollectionService(this.options);

    const result =
      await service.collect();

    console.log(
      '[JobScheduler] Collection completed.',
      {
        queriesExecuted:
          result.queriesExecuted,
        jobsReceived:
          result.jobsReceived,
        jobsNew:
          result.jobsNew,
        jobsUpdated:
          result.jobsUpdated,
        jobsDuplicate:
          result.jobsDuplicate,
        jobsRejected:
          result.jobsRejected,
        jobsReview:
          result.jobsReview,
        jobsAccepted:
          result.jobsAccepted,
        errors:
          result.errors,
      },
    );

    return result;
  }
}