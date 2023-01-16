import React, { Component } from "react";
import styled from "styled-components";
import { hot } from "react-hot-loader/root";
import "./App.css";
import Serial from "../modules/serial";
import SerialPort from "serialport";
import ParameterForm from "./parameters/ParameterForm";
import { Header } from "./Header";
import DataViz from "./visualization/Viz";
import DebugForm from "./debug/DebugForm";
import Titlebar from "react-electron-titlebar";
import Faults from "./Faults";
import { getFaultFlag } from "../modules/faults";

export enum ConnectionState {
  Disconnected = 0,
  Connecting = 1,
  Connected = 2,
}

type AppState = {
  ports: SerialPort.PortInfo[];
  sp: Serial | null;
  mode: Mode;
  connectionState: ConnectionState;
  preventSwitch: boolean;
};

class App extends Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      ports: [],
      sp: null,
      mode: "config",
      connectionState: ConnectionState.Disconnected,
      preventSwitch: false,
    };
  }

  connect = (path: string, baud: number) => {
    const { connectionState } = this.state;
    if (connectionState === ConnectionState.Connected || path.length === 0)
      return;
    const sp = new Serial({
      path,
      baud,
      onOpen: this.openHandler,
      onClose: this.closeHandler,
      onData: this.dataHandler,
    });
    this.setState({ connectionState: ConnectionState.Connecting, sp });
    sp.open();
  };

  disconnect = () => {
    const { sp, preventSwitch } = this.state;
    if (preventSwitch) {
      return;
    }
    sp && sp.close();
    this.setState({ sp: null });
  };

  openHandler = () => {
    this.setState({ connectionState: ConnectionState.Connected });
  };

  closeHandler = () => {
    this.setState({ connectionState: ConnectionState.Disconnected });
  };

  dataHandler = (data: string | Buffer) => {
    //console.log(data.toString())
  };

  connected = () => {
    const { connectionState } = this.state;
    return connectionState === ConnectionState.Connected;
  };

  toggleMode = (mode: Mode) => {
    if (this.state.preventSwitch) {
      return;
    }
    this.setState({ mode });
  };

  setSwitchPrevention = (state: boolean) => {
    this.setState({ preventSwitch: state });
  };

  render() {
    const { connectionState, sp, mode, preventSwitch } = this.state;
    return (
      <>
        {process.platform === "win32" && (
          <div>
            <Titlebar title="Motor Controller" backgroundColor="#000000" />
          </div>
        )}
        <Grid mode={mode}>
          <Header
            onConnect={this.connect}
            onDisconnect={this.disconnect}
            connectionState={connectionState}
            onChange={this.toggleMode}
            mode={mode}
            disable={preventSwitch}
          />
          <ComponentSwitch
            sp={sp}
            mode={mode}
            toggle={this.setSwitchPrevention}
          />
        </Grid>
      </>
    );
  }
}

function ComponentSwitch({
  sp,
  mode,
  toggle,
}: {
  sp: Serial | null;
  mode: Mode;
  toggle: (state: boolean) => void;
}) {
  switch (mode) {
    case "config":
      return <ParameterForm sp={sp} toggle={toggle} />;
    case "viz":
      return <DataViz sp={sp} toggle={toggle} />;
    case "debug":
      return <DebugForm />;
  }
}

export type Mode = "config" | "viz" | "debug";

const Grid = styled.div<{ mode: string }>`
  height: calc(96vh);
  display: grid;
  ${({ mode }) =>
    mode === "debug"
      ? "grid-template-rows: 1fr 10fr"
      : "grid-template-rows: 1fr 9fr 1fr"};
  grid-template-columns: 4fr 1fr;
  grid-gap: 0.5px;
  box-sizing: border-box;
  grid-template-areas:
    "header header"
    "container menu"
    "footer menu";
`;
export default hot(App);
