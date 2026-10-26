import type {
  PrismaClient,
  AcademicEventType,
  AcademicWorkload,
} from '@prisma/client';

import type {
  CreateAcademicEventInput,
  UpdateAcademicEventInput,
} from './academic.types.js';

export class AcademicService {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  async create(
    studentId: string,
    input: CreateAcademicEventInput,
  ) {
    validateDates(
      input.startDate,
      input.endDate,
    );

    validateText(
      input.title,
      'title',
    );

    return this.prisma.academicEvent.create({
      data: {
        studentId,
        type: input.type,
        title: input.title.trim(),
        description:
          input.description.trim(),
        workload: input.workload,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });
  }

  async list(
    studentId: string,
  ) {
    return this.prisma.academicEvent.findMany({
      where: {
        studentId,
      },
      orderBy: [
        {
          startDate: 'asc',
        },
        {
          endDate: 'asc',
        },
      ],
    });
  }

  async getById(
    studentId: string,
    eventId: string,
  ) {
    const event =
      await this.prisma.academicEvent.findFirst({
        where: {
          id: eventId,
          studentId,
        },
      });

    if (!event) {
      throw new Error(
        'ACADEMIC_EVENT_NOT_FOUND',
      );
    }

    return event;
  }

  async update(
    studentId: string,
    eventId: string,
    input: UpdateAcademicEventInput,
  ) {
    const existing =
      await this.getById(
        studentId,
        eventId,
      );

    const startDate =
      input.startDate ??
      existing.startDate;

    const endDate =
      input.endDate ??
      existing.endDate;

    validateDates(
      startDate,
      endDate,
    );

    if (
      input.title !== undefined
    ) {
      validateText(
        input.title,
        'title',
      );
    }

    return this.prisma.academicEvent.update({
      where: {
        id: existing.id,
      },
      data: {
        ...(input.type !== undefined
          ? { type: input.type }
          : {}),

        ...(input.title !== undefined
          ? { title: input.title.trim() }
          : {}),

        ...(input.description !== undefined
          ? {
              description:
                input.description.trim(),
            }
          : {}),

        ...(input.workload !== undefined
          ? {
              workload:
                input.workload,
            }
          : {}),

        ...(input.startDate !== undefined
          ? {
              startDate:
                input.startDate,
            }
          : {}),

        ...(input.endDate !== undefined
          ? {
              endDate:
                input.endDate,
            }
          : {}),
      },
    });
  }

  async delete(
    studentId: string,
    eventId: string,
  ): Promise<void> {
    const existing =
      await this.getById(
        studentId,
        eventId,
      );

    await this.prisma.academicEvent.delete({
      where: {
        id: existing.id,
      },
    });
  }

  async getCurrentConstraint(
    studentId: string,
    now = new Date(),
  ): Promise<{
    score: number;
    workload: AcademicWorkload | null;
    activeEventCount: number;
    events: Awaited<
      ReturnType<
        AcademicService['list']
      >
    >;
  }> {
    const events =
      await this.prisma.academicEvent.findMany({
        where: {
          studentId,

          startDate: {
            lte: addDays(now, 14),
          },

          endDate: {
            gte: now,
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

    if (events.length === 0) {
      return {
        score: 0,
        workload: null,
        activeEventCount: 0,
        events: [],
      };
    }

    const strongest =
      events.reduce(
        (current, event) =>
          workloadScore(event.workload) >
          current.score
            ? {
                score:
                  workloadScore(
                    event.workload,
                  ),
                workload:
                  event.workload,
              }
            : current,
        {
          score: 0,
          workload: null as AcademicWorkload | null,
        },
      );

    return {
      score: strongest.score,
      workload: strongest.workload,
      activeEventCount: events.length,
      events,
    };
  }
}

function validateDates(
  startDate: Date,
  endDate: Date,
): void {
  if (
    Number.isNaN(
      startDate.getTime(),
    ) ||
    Number.isNaN(
      endDate.getTime(),
    )
  ) {
    throw new Error(
      'INVALID_ACADEMIC_DATE',
    );
  }

  if (
    endDate.getTime() <
    startDate.getTime()
  ) {
    throw new Error(
      'ACADEMIC_END_DATE_BEFORE_START_DATE',
    );
  }
}

function validateText(
  value: string,
  field: string,
): void {
  if (
    !value ||
    !value.trim()
  ) {
    throw new Error(
      `${field.toUpperCase()}_REQUIRED`,
    );
  }

  if (value.trim().length > 200) {
    throw new Error(
      `${field.toUpperCase()}_TOO_LONG`,
    );
  }
}

function workloadScore(
  workload: AcademicWorkload,
): number {
  switch (workload) {
    case 'HIGH':
      return 100;
    case 'MEDIUM':
      return 60;
    case 'LOW':
      return 20;
  }
}

function addDays(
  date: Date,
  days: number,
): Date {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}