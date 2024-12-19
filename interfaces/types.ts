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

type MemberInterface = {
  id: string;
  email: string;
  role: string;
};

type GroupedTasks = { [key: string]: TaskInterface[] };

type RenderListProps = {
  id: string;
  name: string;
  isAddButton?: boolean;
};

const dayStyles = {
  Monday: { backgroundColor: "#B3E5FC" },
  Tuesday: { backgroundColor: "#C8E6C9" },
  Wednesday: { backgroundColor: "#FFF9C4" },
  Thursday: { backgroundColor: "#FFE0B2" },
  Friday: { backgroundColor: "#FFCDD2" },
  Saturday: { backgroundColor: "#E1BEE7" },
  Sunday: { backgroundColor: "#F5F5F5" },
};

const dayColorStyle = {
  Monday: { color: "#01579B" },
  Tuesday: { color: "#1B5E20" },
  Wednesday: { color: "#F57F17" },
  Thursday: { color: "#E65100" },
  Friday: { color: "#B71C1C" },
  Saturday: { color: "#4A148C" },
  Sunday: { color: "#616161" },
};

export {
  TaskItemInterface,
  ListNameInterface,
  SubtaskInterface,
  TaskInterface,
  AgendaEventInterface,
  AgendaDataInterface,
  GroupedTasks,
  RenderListProps,
  dayStyles,
  dayColorStyle,
  MemberInterface,
};
