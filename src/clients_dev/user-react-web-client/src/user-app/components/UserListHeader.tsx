/** Table header. We are separating this from TenantList just in case it has to carry out
 * some specific tasks like firing sort event based on the header column clicked.
*/
import React from 'react';


const RoleListHeader: React.FC = () => {

  return (
    <thead>
      <tr>
          <th>Firstname</th>
          <th>Lastname</th>
          <th>Common name</th>
          <th>Gender</th>
          <th>Primary Email</th>
          <th>Landlord?</th>
          <th>Action</th>
      </tr>
    </thead>
  );
}

export default RoleListHeader;
