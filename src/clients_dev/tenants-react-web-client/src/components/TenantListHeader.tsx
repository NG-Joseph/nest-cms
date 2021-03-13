/** Table header. We are separating this from TenantList just in case it has to carry out
 * some specific tasks like firing sort event based on the header column clicked.
*/
import React from 'react';


const TenantListHeader: React.FC = () => {

  return (
    <thead>
      <tr>
          <th>Unique Name</th>
          <th>Contact First Name</th>
          <th>Contact Last Name</th>
          <th>Contact Email</th>
          <th>Status</th>
          <th>Action</th>
      </tr>
    </thead>
  );
}

export default TenantListHeader;
