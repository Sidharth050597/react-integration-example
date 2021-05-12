import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// enum ExampleComponent {
//   "simple-dyte-client" = "simpleDyteMeetingComponent",
//   "custum-layout-button" = "custumLayoutButton",
// }

export const MainScreenComponent: React.FC<{}> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [allMeeetings, setAllMeeting] = useState<any[]>([]);
  const [newMeetingTitle, setNewMeetingTitle] = useState<string>("");
  const [selectedExample, setSelectedExample] =
    useState<string>("simple-dyte-client");

  let history = useHistory();

  const handleCreateRoomClick = useCallback((title) => {
    axios({
      url: `${process.env.REACT_APP_BASE_URL}/v1/organizations/${process.env.REACT_APP_ORG_ID}/meeting`,
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `APIKEY ${process.env.REACT_APP_API_KEY}`,
      },
      data: {
        title: title,
      },
    })
      .then((res) => {
        let rooms = allMeeetings;
        rooms.push(res.data.data.meeting);
        setAllMeeting([...rooms]);
        setNewMeetingTitle("");
      })
      .catch((err) => console.error(err));
  }, []);

  const joinExistingRoom = async (
    meetingId: string,
    roomName: string,
    isHost: boolean = false
  ) => {
    const resp = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/v1/organizations/${process.env.REACT_APP_ORG_ID}/meetings/${meetingId}/participant`,
      {
        clientSpecificId: Math.random().toString(36).substring(7),
        userDetails: {
          name: isHost
            ? "Host"
            : "Participant" + Math.random().toString(36).substring(2),
        },
        roleName: isHost ? "host" : undefined,
      },
      {
        headers: {
          Authorization: `APIKEY ${process.env.REACT_APP_API_KEY}`,
        },
      }
    );

    const authResponse = resp.data.data.authResponse;
    const authToken = authResponse.authToken;

    //saving meeting details in session storage
    sessionStorage.setItem("auth", authToken);
    sessionStorage.setItem("meetingID", meetingId);
    sessionStorage.setItem("roomName", roomName);

    //redirecting to the example meeting page
    history.push(`/${selectedExample}/meeting/${meetingId}`);
  };

  useEffect(() => {
    axios({
      url: `${process.env.REACT_APP_BASE_URL}/v1/organizations/${process.env.REACT_APP_ORG_ID}/meetings`,
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `APIKEY ${process.env.REACT_APP_API_KEY}`,
      },
    })
      .then((response) => {
        setAllMeeting(response.data.data.meetings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="main-screen-wrapper">
      <img src="/logo/dyte_logo_white.svg" alt="dyte-logo" />
      <h1>Welcome to the example app.</h1>
      <div className="flex row">
        <input
          type="text"
          value={newMeetingTitle}
          placeholder="New meeting title"
          onChange={(e) => setNewMeetingTitle(e.target.value)}
        />
        <button
          className="margin-left"
          onClick={() => handleCreateRoomClick(newMeetingTitle)}
        >
          Create Room
        </button>
      </div>
      <div className="divider" />
      <h3>Choose Example </h3>
      <select onChange={(e) => setSelectedExample(e.target.value)}>
        <option value="simple-dyte-client">simple-dyte-client</option>
        <option value="custum-layout-button">custum-layout-button</option>
      </select>
      <div className="ex-det">
        <div>Check the example component here</div>
        <br />
        <code>/src/exampleComponent/{selectedExample}</code>
      </div>
      <div className="divider" />
      <div className="existing-meeting-wrapper flex column ">
        <h3>List of created rooms.</h3>
        <h5>Click to join as new participant or as a host.</h5>
        <div className="existing-meeting-list flex row ">
          {!loading &&
            allMeeetings.map((el, k) => {
              return (
                <div key={el.id} className="flex column meeting-list-wrapper">
                  <li key={k}>{el.title}</li>
                  <div className="flex row">
                    <button
                      onClick={() => joinExistingRoom(el.id, el.roomName, true)}
                    >
                      Join as Host{" "}
                    </button>
                    <button
                      className="margin-left"
                      onClick={() => joinExistingRoom(el.id, el.roomName)}
                    >
                      Join as Participant{" "}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
        {!loading && !allMeeetings.length && (
          <div className="flex no-rooms column">
            <div>No existing rooms 🙁 !</div>
            <div>Create a new room above</div>
          </div>
        )}
      </div>
    </div>
  );
};