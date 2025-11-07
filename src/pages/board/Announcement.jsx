import React from 'react'
// fetch hooks
import { useFetchAnnouncement } from '../../backend/hooks/board/useFetchAnnouncements'

// mutation hooks
import { useSendAnnouncement } from '../../backend/hooks/board/useSendAnnouncemnt'

// components
import DataTableV2 from './components/DataTableV2';
import LoanAccModal from './modal/LoanAccModal';

function Announcement() {
  // Fetch announcements
  const { data: announcements, isLoading, isError, error } = useFetchAnnouncement();

  // Send announcement mutation
  const { mutate: sendAnnouncement, isPending: isSending } = useSendAnnouncement();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <div className="flex flex-row items-center gap-3">
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={() => { }}
            >
              Send Announcement
            </button>
          </div>
        </div>
        <DataTableV2
          title="Announcements"
          headers={["ID", "Message", "Created At", "Sender ID"]}
          showLinkPath={false}
          data={announcements || []}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const row_id = row?.id || "N/A";
            const msg = row?.message || "N/A";
            const createdAt = row?.created_at || "N/A";
            const senderId = row?.sender_id || "N/A";

            return (
              <tr key={row_id}
              onClick={() => (console.log(row))}
              className="hover:bg-base-200/50">
                <td className="text-center">{row_id}</td>
                <td className="text-center">{msg}</td>
                <td className="text-center">{new Date(createdAt).toLocaleString()}</td>
                <td className="text-center">{senderId}</td>
              </tr>
            )
          }}
        />

      </div>  
    </div>
  )
}

export default Announcement