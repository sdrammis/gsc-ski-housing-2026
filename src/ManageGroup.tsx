import type { Schema } from "../amplify/data/resource";
import { Button, useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from "aws-amplify/data";
import { useNavigate } from 'react-router-dom';


const client = generateClient<Schema>();

function ManageGroup() {
  const { user } = useAuthenticator();
  const userEmail = user.signInDetails?.loginId;
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  useEffect(() => {
    client.models.Group.observeQuery().subscribe({
      next: (data) => {
        setGroups([...data.items]);
        setGroupsLoaded(true);
      },
    });
  }, []);

  const group = groups.find(group => group.owner === userEmail);

  if (!groupsLoaded) return <div>Loading...</div>;

  if (!group) {
    return <div>You have no groups to manage.</div>;
  }

  const handleUpdatePreferences = async (preferred_gender: string, split_bed: boolean) => {
    try {
      await client.models.Group.update({
        id: group.id,
        preferred_gender: preferred_gender,
        split_bed: split_bed
      } as any);
    } catch (error) {
      alert("Error updating preferences.");
    }
  };

  const handleConfirm = async (email: string) => {
    try {
      await client.models.Group.update({
        id: group.id,
        members: [...(group.members || []), email],
        pending_members: (group.pending_members || []).filter(e => e !== email)
      } as any);
    } catch (error) {
      alert("Error confirming request.");
    }
  };

  const handleDeny = async (email: string) => {
    try {
      await client.models.Group.update({
        id: group.id,
        pending_members: (group.pending_members || []).filter(e => e !== email)
      } as any);
    } catch (error) {
      alert("Error denying request.");
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (window.confirm(`Remove ${email} from the group?`)) {
      try {
        await client.models.Group.update({
          id: group.id,
          members: (group.members || []).filter(e => e !== email)
        } as any);
      } catch (error) {
        alert("Error removing member.");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete the group? This action cannot be undone.")) {
      try {
        await client.models.Group.delete({ id: group.id });
        navigate('/');
      } catch (error) {
        alert("Error deleting group.");
      }
    }
  };

  return (
    <div style={{width: '25em'}}>
      <h2>Manage "{group.name}"</h2>
      <p>Total members: {1 + (group.members?.length || 0)} (members) + {(group.pending_members?.length || 0)} (pending) / 6</p>
      {1 + (group.members?.length || 0) + (group.pending_members?.length || 0) > 6 && (
        <p style={{color: 'red'}}>You have too many members! Make sure your group has no more than 6 members (confirmed and pending requests), otherwise we will be forced to split you up.</p>
      )}

      <h3>Preferences</h3>
      <div>
        <label style={{marginRight: '0.5em'}}>Gender preference:</label>
        <select 
          value={group.preferred_gender || 'NONE'} 
          onChange={(e) => handleUpdatePreferences(e.target.value, group.split_bed || false)}
        >
          <option value="NONE">No preference</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
      </div>
      <div>
        <label style={{marginRight: '0.5em'}}>King bed split:</label>
        <select 
          value={group.split_bed ? 'Yes' : 'No'} 
          onChange={(e) => handleUpdatePreferences(group.preferred_gender || 'NONE', e.target.value === 'Yes')}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <h3>Current Members</h3>
      <ul>
        <li key={group.owner}> {group.owner} (You)</li>
        {(group.members || []).map(email => (
          <li key={email} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1em' }}>
            {email} 
            <button className='li-btn li-btn-red' onClick={() => handleRemoveMember(email)}>Remove</button>
          </li>
        ))}
      </ul>

      <h3>Pending Requests</h3>
      {(group.pending_members || []).length > 0 ? (
        <ul>
          {(group.pending_members || []).map(email => (
            <li key={email} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1em' }}>
              {email}
              <div>
                <button style={{ marginRight: '0.5em' }} className='li-btn li-btn-green' onClick={() => handleConfirm(email)}>Confirm</button>
                <button className='li-btn li-btn-red' onClick={() => handleDeny(email)}>Deny</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>There are no pending requests...</p>
      )}

      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <button style={{ fontSize: '.9em' }} onClick={() => navigate('/')}>Done</button>
        <button style={{fontSize: '.9em'}} className='li-btn-red' onClick={handleDeleteGroup}>Delete Group</button>
      </div>
    </div>
  );
}

export default ManageGroup;
