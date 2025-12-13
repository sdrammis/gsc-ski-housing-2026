import type { Schema } from "../amplify/data/resource";
import { Button, useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from "aws-amplify/data";


const client = generateClient<Schema>();

function EditGroup() {
  return (
    <div>
        Edit group page
    </div>
  )
}

export default EditGroup;
