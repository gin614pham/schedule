const getDateAndTime = () => {
  const currentDate = new Date().toISOString();

  const onlyDate = currentDate.split("T")[0];
  const onlyTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  return { onlyDate, onlyTime, currentDate };
};

export default getDateAndTime;
