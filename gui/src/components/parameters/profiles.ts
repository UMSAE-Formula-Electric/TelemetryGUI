type Profile = {
  name: string;
  initial: string;
  backgroundColor: string;
  selected: boolean;
  presets: string[];
};

const profiles: Profile[] = [
  {
    name: "Beginner",
    initial: "B",
    backgroundColor: "lightblue",
    selected: true,
    presets: ["255", "100", "120", "100.25"],
  },
  {
    name: "Training",
    initial: "T",
    backgroundColor: "lightgreen",
    selected: false,
    presets: ["300", "40", "65", "40.5"],
  },
  {
    name: "Experienced",
    initial: "E",
    backgroundColor: "red",
    selected: false,
    presets: ["100", "98", "1000", "12.75"],
  },
];

export default profiles;
