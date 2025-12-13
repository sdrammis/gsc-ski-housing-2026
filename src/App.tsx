import type { Schema } from "../amplify/data/resource";
import { Button, useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from "aws-amplify/data";
import { Link, Route, Routes } from 'react-router-dom'
import { isUserInAGroup } from "./utils";


const client = generateClient<Schema>();

function requestToJoinGroup() {
  // TODO
  return
}

function App() {
  const { signOut, user } = useAuthenticator();
  const userEmail = user.signInDetails?.loginId;

  const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
  useEffect(() => {
    client.models.Group.observeQuery().subscribe({
      next: (data) => setGroups([...data.items]),
    });
  }, []);

  const isInGroup = isUserInAGroup(client, userEmail);
  function GroupButton({ group }) {
    if (group.owner == userEmail) {
      return (
        <Link to="/manage-group">
          <button className='li-btn'>Manage</button>
        </Link>
      );
    } 
    if (group.members?.includes(userEmail)) {
      return <button className='li-btn li-btn-red'>Leave</button>;
    } 
    if (group.pending_members?.includes(userEmail)) {
      return <button className='li-btn li-btn-red'>Cancel request</button>;
    }
  }

  function RequestButton() {
    // TODO: Request logic
    return <button className='li-btn'>Request to join</button>
  }



  // TODO:
  // - [x] New group
  //    - [x] Owners or group members can't create new groups
  // - [ ] Requests and confirm requests to join groups -- can't request if there are 6 people already
  //    - [ ] Request button
  // - [ ] Group management page for owners to update preferences, delete the group, and manage people
  // - [x] User kerbs instead of full emails

  return (
    <div style={{width: '50em'}}>
      <h2> MIT GSC 2026 Ski Trip </h2>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <Link to="/new-group">
          <button disabled={isInGroup}>Create new group +</button>
        </Link>
        <button style={{backgroundColor: "#e5e5e5", color: "black", borderColor: "black" }} onClick={signOut}>Sign out</button>
      </div>
      <ul>
        {groups.map((group) => (
          <li key={group.id} style={{maxWidth: '100%'}}>
            <div style={{ fontWeight: 'bold' }}>{group.name}</div>
            <div style={{ fontSize: 12 }}>Owner: {group.owner.split('@')[0]}</div>
            <div style={{ fontSize: 12 }}>Members: {group.members?.map(p => p?.split('@')[0]).join(', ')}</div>
            <div style={{ fontSize: 12 }}>Pending: {group.pending_members?.map(p => p?.split('@')[0]).join(', ')}</div>
            {isInGroup ? <GroupButton group={group} /> : <RequestButton />}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App;
