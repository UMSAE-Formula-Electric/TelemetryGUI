/* probably need a system here where we have all parameters, and a preset min
  and max value for them. Then, we can compare the reading to its min and max
  to determine its background colour */

export type Favourite = {
  name: string;
  value: string;
  color: string;
};

const favourites: Favourite[] = [
  { name: "Sensor 1", value: "31", color: "white" },
  { name: "Sensor 2", value: "65", color: "rgb(255,153,153)" },
  { name: "Sensor 3", value: "134", color: "rgb(214,250,255)" },
  { name: "Sensor 4", value: "5", color: "white" },
  { name: "Sensor 5", value: "19", color: "rgb(255,153,153)" },
  { name: "Sensor 6", value: "12", color: "white" },
  { name: "Sensor 7", value: "4", color: "white" },
  { name: "Sensor 8", value: "37", color: "rgb(214,250,255)" },
  { name: "Sensor 9", value: "99", color: "rgb(214,250,255)" },
  { name: "Sensor 10", value: "0", color: "white" },
  { name: "Sensor 11", value: "17", color: "rgb(255,153,153)" },
  { name: "Sensor 12", value: "12", color: "rgb(214,250,255)" },
];

export default favourites;
