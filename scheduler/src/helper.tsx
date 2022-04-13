import { Task } from "../../dist/types/public-types";

export function initTasks() {
  const currentDate = new Date();
  const tasks: Task[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 30),
      name: "TN Optic Fibre Project",
      id: "OpticFibreProject",
      progress: 30,
      type: "project",
      hideChildren: false,
      displayOrder: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        12,
        24,
        30
      ),
      name: "POP Readiness",
      id: "Task 0",
      progress: 100,
      type: "task",
      project: "OpticFibreProject",
      displayOrder: 2,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        15,
        24,
        0
      ),
      name: "POP Installation",
      id: "Task 1",
      progress: 24,
      dependencies: ["Task 0"],
      type: "task",
      project: "OpticFibreProject",
      displayOrder: 3,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        14,
        24,
        0
      ),
      name: "New Pole Installation",
      id: "Task 2",
      progress: 80,
      // dependencies: ["Task 1"],
      type: "task",
      project: "OpticFibreProject",
      displayOrder: 4,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 17),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        22,
        24,
        0
      ),
      name: "Ariel Cabelling",
      id: "Task 3",
      progress: 14,
      dependencies: ["Task 2"],
      type: "task",
      project: "OpticFibreProject",
      displayOrder: 5,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        24,
        24,
        0
      ),
      name: "UG Cabelling",
      id: "Task 5",
      type: "task",
      progress: 15,
      dependencies: ["Task 2"],
      project: "OpticFibreProject",
      displayOrder: 6,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 13),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        19,
        24,
        0
      ),
      name: "Manhole Installation",
      id: "Task 4",
      type: "task",
      progress: 21,
      // dependencies: ["Task 2"],
      project: "OpticFibreProject",
      displayOrder: 7,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        26,
        24,
        0
      ),
      name: "Route Market Installation",
      id: "Task 6",
      type: "task",
      progress: 10,
      dependencies: ["Task 1"],
      project: "OpticFibreProject",
      displayOrder: 8,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 27),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        29,
        24,
        0
      ),
      name: "Buffer",
      id: "Task 7",
      progress: 0,
      dependencies: ["Task 1", "Task 2"],
      isDisabled: true,
      type: "task",
      displayOrder: 9,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 30),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 30),
      name: "RELEASE",
      id: "Task 8",
      progress: currentDate.getMonth(),
      type: "milestone",
      dependencies: ["Task 4"],
      project: "OpticFibreProject",
      displayOrder: 10,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 26),
      name: "Some other project",
      id: "ProjectSample",
      progress: 0,
      type: "project",
      hideChildren: false,
      displayOrder: 11,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 2),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        9,
        24,
        30
      ),
      name: "Research",
      id: "Task 9",
      progress: 0,
      type: "task",
      project: "ProjectSample",
      displayOrder: 12,
    },
    {
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        10
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        14,
        24,
        30
      ),
      name: "Team discussion",
      id: "Task 10",
      progress: 0,
      type: "task",
      dependencies: ["Task 9"],
      project: "ProjectSample",
      displayOrder: 13,
    },
    {
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        14
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        21,
        24,
        30
      ),
      name: "Development",
      id: "Task 11",
      progress: 0,
      type: "task",
      dependencies: ["Task 9", "Task 10"],
      project: "ProjectSample",
      displayOrder: 14,
    },
    {
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        22
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        24,
        24,
        30
      ),
      name: "Review",
      id: "Task 12",
      progress: 0,
      type: "task",
      project: "ProjectSample",
      dependencies: ["Task 10"],
      displayOrder: 15,
    },
    {
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        26
      ),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 26),
      name: "RELEASE",
      id: "Task 13",
      progress: currentDate.getMonth() + 1,
      type: "milestone",
      dependencies: ["Task 12"],
      project: "ProjectSample",
      displayOrder: 16,
    },
  ];
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter(t => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}
