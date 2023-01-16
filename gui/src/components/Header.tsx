import React, { Component } from "react";
import styled from "styled-components";
import { hot } from "react-hot-loader/root";
import "./App.css";
import { list } from "../modules/serial";
import SerialPort from "serialport";
import PortSelect from "./PortSelect/PortSelect";
import ToggleSwitch from "./ToggleSwitch";
import { ConnectionState, Mode } from "./App";
import { StyledInput } from "./styling/styling";

type HeaderProps = {
  onConnect: (path: string, baud: number) => void;
  onDisconnect: () => void;
  onChange: (mode: Mode) => void;
  mode: Mode;
  connectionState: ConnectionState;
  disable?: boolean;
};

type HeaderState = {
  ports: SerialPort.PortInfo[];
  path: string;
  baud: number;
};

export class Header extends Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      ports: [],
      path: "",
      baud: 921600,
    };
  }

  componentDidMount() {
    this.getPorts();
  }

  toggleConnection = () => {
    const { connectionState } = this.props;
    const { path, baud } = this.state;
    switch (connectionState) {
      case ConnectionState.Connecting:
        return;
      case ConnectionState.Connected:
        return this.props.onDisconnect();
      case ConnectionState.Disconnected:
        if (isNaN(baud)) {
          return;
        }
        return this.props.onConnect(path, this.state.baud);
    }
  };

  updatePath = (path: string) => {
    this.props.onDisconnect();
    this.setState({ path });
  };

  getPorts = async () => {
    const ports = await list();
    this.setState({ ports, path: "" });
  };

  connected = () => {
    return this.props.connectionState === ConnectionState.Connected;
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ baud: +e.target.value });
  };

  render() {
    const { ports, baud } = this.state;
    const { connectionState, onChange, mode, disable } = this.props;
    return (
      <StyledHeader
        style={disable ? { pointerEvents: "none", opacity: "60%" } : {}}
      >
        <Tabs>
          <Tab selected={mode === "config"} onClick={() => onChange("config")}>
            Configure
          </Tab>
          <Tab selected={mode === "viz"} onClick={() => onChange("viz")}>
            Visualize
          </Tab>
          <Tab selected={mode === "debug"} onClick={() => onChange("debug")}>
            Debug
          </Tab>
        </Tabs>
        <Connection>
          <PortSelect
            onRefresh={this.getPorts}
            onChange={this.updatePath}
            ports={
              typeof ports === "undefined"
                ? [""]
                : ports.map((p) => (p as any).path)
            }
          />
          <label style={{ color: "#000000", marginRight: "0" }}>
            Baudrate:
          </label>
          <StyledInput
            disabled={connectionState === ConnectionState.Connected}
            defaultValue={baud.toString()}
            onChange={this.handleChange}
            style={{ width: "60px" }}
            valid={!isNaN(baud)}
          />
          <ToggleSwitch
            state={this.connected()}
            onClick={this.toggleConnection}
          />
          <Status connected={this.connected()}>{`${getConnectionText(
            connectionState,
          )}`}</Status>
        </Connection>
      </StyledHeader>
    );
  }
}

function getConnectionText(state: ConnectionState) {
  switch (state) {
    case ConnectionState.Connecting:
      return "Connecting...";
    case ConnectionState.Connected:
      return "Connected";
    case ConnectionState.Disconnected:
      return "Disconnected";
  }
}

const Tabs = styled.span`
  & > * {
    margin-right: 20px;
  }
`;

const Tab = styled.h2<{ selected?: boolean }>`
  display: inline-block
  color: ${({ selected }) => (selected ? "#367AFF" : "#000000")};
  cursor: pointer;
  text-decoration: ${({ selected }) => (selected ? "underline" : "")};
  &:hover{
    text-decoration: underline;
    cursor: ${({ selected }) => (selected ? "default" : "pointer")};
  }
  user-select: none;
`;

const StyledHeader = styled.div`
  grid-area: header;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1.25vw;
  box-sizing: border-box;
  background-color: #e4e4e4;
`;

const Connection = styled.span`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: inherit;
  float: right;
  & > * {
    margin: 0 10px;
  }
`;

const Status = styled.span<{ connected: boolean }>`
  transition: color 0.5s;
  color: ${({ connected }) => (connected ? "#7BB557" : "#FF7B7B")};
  width: 100px;
  font-weight: bold;
  text-align: left;
  margin-left: 5px;
  margin-right: 0;
`;

export default hot(Header);
