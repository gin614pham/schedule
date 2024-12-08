const getNumberOfColumns = (width: number) => {
  return width < 700 ? 2 : width < 1000 ? 3 : width < 1300 ? 4 : 5;
};

const getWithItemList = (width: number) => {
  return width < 700
    ? "48%"
    : width < 1000
    ? "32%"
    : width < 1300
    ? "24%"
    : "18%";
};

export { getNumberOfColumns, getWithItemList };
