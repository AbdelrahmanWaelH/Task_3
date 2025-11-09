import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function AllPerks() {
  
 
  const [perks, setPerks] = useState([])

  const [searchQuery, setSearchQuery] = useState('')

 
  const [merchantFilter, setMerchantFilter] = useState('')

 
  const [uniqueMerchants, setUniqueMerchants] = useState([])

  
  const [loading, setLoading] = useState(true)

  
  const [error, setError] = useState('')

  // ==================== SIDE EFFECTS WITH useEffect HOOK ====================

 /*
 TODO: HOOKS TO IMPLEMENT
 * useEffect Hook #1: Initial Data Loading
 * useEffect Hook #2: Auto-search on Input Change

*/

  
  useEffect(() => {
    // Extract all merchant names from perks array
    const merchants = perks
      .map(perk => perk.merchant) // Get merchant from each perk
      .filter(merchant => merchant && merchant.trim()) // Remove empty/null values
    
    // Create array of unique merchants using Set
    // Set automatically removes duplicates, then we convert back to array
    const unique = [...new Set(merchants)]
    
    // Update state with unique merchants
    setUniqueMerchants(unique)
    
    // This effect depends on [perks], so it re-runs whenever perks changes
  }, [perks]) // Dependency: re-run when perks array changes

  // Load all perks on initial mount
  useEffect(() => {
    loadAllPerks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced auto-search: whenever searchQuery or merchantFilter changes,
  // wait briefly and then reload perks. This keeps the UI responsive
  // while avoiding excessive network requests.
  useEffect(() => {
    const t = setTimeout(() => {
      loadAllPerks()
    }, 300)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, merchantFilter])

  
  async function loadAllPerks(overrides = {}) {
    // Reset error state before new request
    setError('')
    
    // Show loading indicator
    setLoading(true)
    
    try {
      // Compute params using overrides (useful for reset) or current state
      const search = (typeof overrides.search !== 'undefined') ? overrides.search : searchQuery
      const merchant = (typeof overrides.merchant !== 'undefined') ? overrides.merchant : merchantFilter

      // Make GET request to /api/perks/all with query parameters
      const res = await api.get('/perks/all', {
        params: {
          // Only include search param if search is not empty
          search: (search || '').trim() || undefined,
          // Only include merchant param if merchant is not empty
          merchant: (merchant || '').trim() || undefined
        }
      })

      // Update perks state with response data
      setPerks(res.data.perks)

    } catch (err) {
      // Handle errors (network failure, server error, etc.)
      console.error('Failed to load perks:', err)
      setError(err?.response?.data?.message || 'Failed to load perks')
      
    } finally {
      // This block runs whether try succeeds or catch handles error
      // Always stop loading indicator
      setLoading(false)
    }
  }

  // ==================== EVENT HANDLERS ====================

  
  function handleSearch(e) {
    // Prevent default form submission behavior (page reload)
    e.preventDefault()
    
    // Immediately reload perks with current search and filter values
    // This bypasses the debounce delay for instant results
    loadAllPerks()
  }

  
  function handleReset() {
    // Reset search and filter states to empty
    // The useEffect with [searchQuery, merchantFilter] dependencies
    // will automatically trigger and reload all perks
    setSearchQuery('')
    setMerchantFilter('')
    // Immediately load all perks without filters
    loadAllPerks({ search: '', merchant: '' })
  }

  
  
  return (
    /*
    TODO: HTML INPUT HANDLERS
 * Update state when user types in search box
 * update state when user selects filter
    */
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Perks</h1>
        <div className="text-sm text-zinc-600">
          Showing {perks.length} perk{perks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search and Filter Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">search</span>
                {' '}Search by Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter perk name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Auto-searches as you type, or press Enter / click Search
              </p>
            </div>

            {/* Merchant Filter Dropdown - Controlled Component */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">store</span>
                {' '}Filter by Merchant
              </label>
              <select
                className="input"
                value={merchantFilter}
                onChange={e => setMerchantFilter(e.target.value)}
              >
                <option value="">All Merchants</option>
                
                {uniqueMerchants.map(merchant => (
                  <option key={merchant} value={merchant}>
                    {merchant}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            <button type="submit" className="btn bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
              <span className="material-symbols-outlined text-sm align-middle">search</span>
              {' '}Search Now
            </button>
            <button 
              type="button" 
              onClick={handleReset}
              className="btn"
            >
              <span className="material-symbols-outlined text-sm align-middle">refresh</span>
              {' '}Reset Filters
            </button>
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Searching...
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Error Message - Inline, doesn't replace the UI */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
            <button onClick={loadAllPerks} className="btn text-sm">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Perks Grid - Always visible, updates in place */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 
          Conditional Rendering with map():
          - If perks.length > 0: Show perk cards
          - If perks.length === 0: Show empty state (after the map)
        */}
        {perks.map(perk => (
          
          <Link
            key={perk._id}
            to={`/perks/${perk._id}`}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Perk Title */}
            <div className="font-semibold text-lg text-zinc-900 mb-2">
              {perk.title}
            </div>

            {/* Perk Metadata */}
            <div className="text-sm text-zinc-600 space-y-1">
              {/* Conditional Rendering with && operator */}
              {/* Only show merchant if it exists */}
              {perk.merchant && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">store</span>
                  {perk.merchant}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">category</span>
                <span className="capitalize">{perk.category}</span>
              </div>
              
              {perk.discountPercent > 0 && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <span className="material-symbols-outlined text-xs">local_offer</span>
                  {perk.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Description - truncated if too long */}
            {perk.description && (
              <p className="mt-2 text-sm text-zinc-700 line-clamp-2">
                {perk.description}
              </p>
            )}

            {/* Creator info - populated from backend */}
            {perk.createdBy && (
              <div className="mt-3 pt-3 border-t border-zinc-200 text-xs text-zinc-500">
                Created by: {perk.createdBy.name || perk.createdBy.email}
              </div>
            )}
          </Link>
        ))}

        
        {perks.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-zinc-600">
            <span className="material-symbols-outlined text-5xl mb-4 block text-zinc-400">
              sentiment_dissatisfied
            </span>
            <p className="text-lg">No perks found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}

        
        {loading && perks.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-600">
            <span className="material-symbols-outlined text-5xl mb-4 block text-zinc-400 animate-spin">
              progress_activity
            </span>
            <p className="text-lg">Loading perks...</p>
          </div>
        )}
      </div>
    </div>
  )
}

