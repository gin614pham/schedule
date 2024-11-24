type TaskItemInterface = {
  id: string;
  name: string;
  completed: boolean;
};

type ListNameInterface = {
  id: string;
  name: string;
};

type SubtaskInterface = {
  id: string;
  idsubtask: string;
  name: string;
  completed: boolean;
};

type TaskInterface = {
  id: string;
  name: string;
  completed: boolean;
  date: string;
  lastUpdated: string;
  time: string;
};

type AgendaEventInterface = {
  id: string;
  title: string;
  hour: string;
};

type AgendaDataInterface = {
  title: string;
  data: AgendaEventInterface[];
};

export {
  TaskItemInterface,
  ListNameInterface,
  SubtaskInterface,
  TaskInterface,
  AgendaEventInterface,
  AgendaDataInterface,
};
