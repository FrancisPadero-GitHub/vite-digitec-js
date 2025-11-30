import { useState } from 'react'
import {
  useSettingsCategory,
  useUpdateSetting
} from '../../backend/hooks/board/useSettings'

function Settings() {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Fetch settings by category
  const { data: settings, isLoading } = useSettingsCategory("loan_eligibility");

  const updateMutation = useUpdateSetting()

  const getSettingLabel = (key) => {
    const labels = {
      'tenure': 'Minimum Tenure',
      'age': 'Minimum Age',
      'share_capital': 'Minimum Share Capital',
      'share_capital_percentage': 'Share Capital Percentage'
    }
    return labels[key] || key
  }

  const getSettingDescription = (key) => {
    const descriptions = {
      'tenure': 'Years of membership required.',
      'age': 'Minimum age requirement.',
      'share_capital': 'PHP minimum share capital required.',
      'share_capital_percentage': 'Percentage of share capital loan (LAD) loanable.'
    }
    return descriptions[key] || ''
  }

  const handleEdit = (setting) => {
    setEditingId(setting.id)
    setEditValue(setting.value)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleUpdate = (setting) => {
    updateMutation.mutate({
      id: setting.id,
      category: setting.category,
      key: setting.key,
      value: editValue
    }, {
      onSuccess: () => {
        setEditingId(null)
        setEditValue('')
      },
      onError: (error) => {
        alert('Failed to update setting: ' + error.message)
      }
    })
  }

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="flex justify-center min-h-screen p-2 sm:p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold">Loan Eligibility Settings</h1>
            <p className="mt-1 text-xs sm:text-sm lg:text-base">Configure the minimum requirements for loan applications</p>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {settings?.map((setting) => (
            <div
              key={setting.id}
              className="rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1">
                      {getSettingLabel(setting.key)}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {getSettingDescription(setting.key)}
                    </p>
                  </div>
                </div>

                {/* Card Body - Value Display or Edit */}
                {editingId === setting.id ? (
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                        Value
                      </label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>

                    {/* Edit Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(setting)}
                        disabled={updateMutation.isPending}
                        className="flex-1 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                        className="flex-1 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base bg-base-200 text-base-content rounded-md hover:bg-base-300 disabled:bg-base-300 disabled:text-base-300 disabled:cursor-not-allowed transition-colors border border-base-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Current Value Display */}
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-baseline">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400">
                          {setting.value}
                        </span>
                        <span className="ml-1 sm:ml-2 text-sm sm:text-base text-base-content">
                          {setting.key === 'tenure' && 'years'}
                          {setting.key === 'age' && 'years'}
                          {setting.key === 'share_capital' && 'PHP'}
                          {setting.key === 'share_capital_percentage' && '%'}
                        </span>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs mb-3 sm:mb-4 text-base-content/70">
                      Last updated: {new Date(setting.updated_at).toLocaleDateString()}
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(setting)}
                      className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {settings?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-sm sm:text-base">No settings found for loan eligibility.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings