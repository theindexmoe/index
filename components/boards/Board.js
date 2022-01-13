import React, { useEffect, useState } from 'react'
import ColumnFilter from '../ColumnFilter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from 'react-toastify'
import { postData } from '../../lib/utils'
import CreateNewButton from '../buttons/CreateNewButton'
import CardRowView from '../CardRowView'
import { useSession } from 'next-auth/client'
import { canEdit } from '../../lib/session'
import classNames from 'classnames'
import styles from './Board.module.css'
import ItemCard from '../cards/ItemCard'
import { ColumnType } from '../../types/Column'
import Pagination from '../data/Pagination'
import Select from '../data/Select'

const Board = ({
  _id,
  content,
  allContent,
  sponsorContent = [],
  type, // item, column, collection or tab
  updateContentURL = '',
  updateContentKey = '',
  deleteContentURL = '',
  columns = [],
  forceEditMode = false,
  canMove = true,
  canEdit: allowEdit = false,
}) => {
  allContent = allContent || content
  const [_content, setContent] = useState(content)
  const [unselectedContent, setUnselectedContent] = useState(
    allContent.filter((i) => !content.some((ii) => i._id === ii._id))
  )
  const [searchString, setSearchString] = useState('')

  const [session] = useSession()
  const [editMode, setEditMode] = useState(forceEditMode)
  const [cardView, setCardView] = useState(true)
  const [compactView, setCompactView] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [columnFilter, setColumnFilter] = useState({})

  const [startViewIndex, setStartViewIndex] = useState(0)
  const pageSizes = [15, 30, 60, 0]
  const [pageSize, setPageSize] = useState(pageSizes[0])
  const sortOptions = [
    {
      name: 'asc',
      sort: (a, b) => (a.name < b.name ? -1 : 1),
    },
    {
      name: 'desc',
      sort: (a, b) => (a.name > b.name ? -1 : 1),
    },
    {
      name: 'latest',
      sort: (a, b) =>
        new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime()
          ? -1
          : 1,
    },
    {
      name: 'oldest',
      sort: (a, b) =>
        new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()
          ? -1
          : 1,
    },
  ]
  const [sortOption, setSortOption] = useState(sortOptions[0])

  useEffect(() => {
    setUnselectedContent(
      allContent.filter((c) => !_content.some((cc) => cc._id === c._id))
    )
  }, [_content, allContent])
  useEffect(() => {
    setContent(content)
  }, [content])

  const randString = Math.random().toString(36).slice(2)

  const sortContent = (newContent) => {
    return newContent.sort(sortOption.sort)
  }

  const updateContent = (newContent, newUnselectedContent) => {
    let body = {
      _id: _id,
    }
    body[updateContentKey] = newContent.map((i) => i._id)

    if (updateContentURL !== '' && updateContentKey !== '') {
      const toastId = toast.loading('Saving changes...')
      fetch(updateContentURL, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => {
        if (r.status !== 200) {
          toast.update(toastId, {
            render: 'Failed to save changes',
            type: 'error',
            isLoading: false,
            autoClose: 1000,
          })
        } else {
          setContent(newContent)
          setUnselectedContent(newUnselectedContent)
          toast.update(toastId, {
            render: 'Saved changes',
            type: 'success',
            isLoading: false,
            autoClose: 1000,
          })
        }
      })
    } else {
      console.warn('No updateContentURL or updateContentKey provided')
    }
  }

  const renderSingleContent = (
    renderContent,
    addAllowed = false,
    moveAllowed = false,
    removeAllowed = false
  ) => {
    return (
      <CardRowView
        key={renderContent._id}
        cardView={cardView}
        type={type}
        content={renderContent}
        add={
          addAllowed
            ? () => {
                let newContent = _content.concat([renderContent])
                if (moveAllowed) {
                  newContent = sortContent(newContent)
                }

                const newUnselectedContent = unselectedContent.filter(
                  (i) => i._id !== renderContent._id
                )
                updateContent(newContent, newUnselectedContent)
              }
            : null
        }
        move={
          moveAllowed
            ? (move) => {
                const currentPosition = _content.findIndex(
                  (c) => c._id === renderContent._id
                )
                if (
                  !(
                    (currentPosition === 0 && move < 0) ||
                    (currentPosition === _content.length && move > 0)
                  )
                ) {
                  const temp = _content[currentPosition]
                  const temp2 = _content[currentPosition + move]

                  let copy = _content
                  copy[currentPosition] = temp2
                  copy[currentPosition + move] = temp
                  updateContent(copy, unselectedContent)
                }
              }
            : null
        }
        remove={
          removeAllowed
            ? () => {
                const newContent = _content.filter(
                  (i) => i._id !== renderContent._id
                )
                if (deleteContentURL !== '') {
                  if (
                    confirm(
                      `Do you really want to delete the ${type} "${renderContent.name}"?`
                    )
                  ) {
                    postData(
                      deleteContentURL,
                      { _id: renderContent._id },
                      () => {
                        setContent(newContent)
                      }
                    )
                  }
                } else {
                  let newUnselectedContent = unselectedContent.concat([
                    renderContent,
                  ])
                  if (moveAllowed) {
                    newUnselectedContent = sortContent(newUnselectedContent)
                  }
                  updateContent(newContent, newUnselectedContent)
                }
              }
            : null
        }
        columns={compactView ? [] : columns}
      />
    )
  }

  const filterContent = (contentList) => {
    return contentList.filter((c) => {
      if (
        searchString !== '' &&
        typeof c.name === 'string' &&
        !c.name.toLowerCase().includes(searchString)
      ) {
        return false
      }

      return columns
        .filter((column) => typeof columnFilter[column._id] !== 'undefined')
        .every((column) => {
          console.log(
            'Filter for column',
            column,
            'for content',
            c,
            'with filter',
            columnFilter
          )

          if (!(column._id in c.data)) {
            return false
          }

          if (
            column.type === ColumnType.array ||
            column.type === ColumnType.language
          ) {
            return (
              columnFilter.length === 0 ||
              columnFilter[column._id].every((value) =>
                c.data[column._id].includes(value)
              )
            )
          } else if (
            column.type === ColumnType.boolean ||
            column.type === ColumnType.proAndCon
          ) {
            return c.data[column._id] === columnFilter[column._id]
          }

          return c.data[column._id]
            .toLowerCase()
            .includes(columnFilter[column._id].toLowerCase())
        })
    })
  }

  const filteredContent = filterContent(_content).filter(
    (cc) => editMode || !sponsorContent.some((c) => c._id === cc._id)
  )
  const filteredUnselectedContent = filterContent(unselectedContent)
  const paginatedContent = filteredContent.filter(
    (content, index) =>
      pageSize === 0 ||
      (index >= startViewIndex && index < startViewIndex + pageSize)
  )

  return (
    <>
      {!editMode && sponsorContent.length > 0 && (
        <div
          className={'d-flex flex-wrap mb-2'}
          style={{ marginRight: '-0.5rem' }}
        >
          {sponsorContent.map((c) => (
            <ItemCard item={c} columns={columns} key={c._id} />
          ))}
        </div>
      )}

      <div className={'card card-body bg-2 mb-2'}>
        <div className={'row g-2'}>
          <div className={'col-12 col-sm-6 col-md-auto'}>
            {columns.length > 0 && (
              <button
                className={'btn btn-outline-primary'}
                type={'button'}
                onClick={() => setShowFilter(!showFilter)}
                aria-expanded='false'
                aria-controls={'collapseFilter'}
              >
                <FontAwesomeIcon icon={['fas', 'filter']} /> Filter
              </button>
            )}

            {content.length > 1 && (
              <div
                className={'d-inline-block ms-2 rounded'}
                style={{
                  border: 'solid 1px var(--bs-secondary)',
                  verticalAlign: 'middle',
                }}
              >
                <Select
                  options={sortOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                  hover={'Sort by'}
                  onChange={(event) => {
                    const newSortOption = sortOptions.find(
                      (option) => option.name === event.target.value
                    )
                    console.log('Changed sorting to', newSortOption)
                    setSortOption(newSortOption)
                    setContent(content.sort(newSortOption.sort))
                  }}
                />
              </div>
            )}

            <button
              className={classNames(
                styles.gridListToggle,
                'btn btn-outline-secondary',
                'ms-2'
              )}
              type={'button'}
              onClick={() => setCardView(!cardView)}
            >
              <FontAwesomeIcon
                icon={['fas', cardView ? 'th-list' : 'th-large']}
              />{' '}
              {cardView ? 'List' : 'Grid'}
            </button>

            {columns.length > 0 && (
              <button
                className={'btn btn-outline-secondary ms-2'}
                type={'button'}
                onClick={() => setCompactView(!compactView)}
              >
                <FontAwesomeIcon
                  icon={['fas', compactView ? 'expand' : 'compress']}
                  className={'me-2'}
                />
                {compactView ? 'More details' : 'Less details'}
              </button>
            )}
          </div>
          <div className={'col-12 col-sm-6 col-md'}>
            <div className={'input-group'}>
              <span className='input-group-text' id='inputSearchStringAddon'>
                <FontAwesomeIcon icon={['fas', 'search']} />
              </span>
              <input
                value={searchString}
                type={'text'}
                className={'form-control'}
                onChange={(e) => {
                  setSearchString(e.target.value.toLowerCase())
                  setStartViewIndex(0)
                }}
                aria-label={'Search input'}
                placeholder={'Type something to search...'}
                aria-describedby={'inputSearchStringAddon'}
              />
            </div>
          </div>
          <div className={'col-12 col-lg-auto'}>
            <CreateNewButton type={type} allowEdit={allowEdit} />
            {!forceEditMode && canEdit(session, type) && (
              <button
                className={'btn btn-outline-warning mb-2'}
                type={'button'}
                onClick={() => {
                  if (
                    editMode &&
                    startViewIndex >=
                      filteredContent.length - sponsorContent.length
                  ) {
                    setStartViewIndex(Math.max(startViewIndex - pageSize, 0))
                  }
                  setEditMode(!editMode)
                }}
              >
                {editMode ? 'Exit' : <FontAwesomeIcon icon={['fas', 'edit']} />}{' '}
                edit-mode
              </button>
            )}
          </div>
        </div>

        {columns.length > 0 && (
          <div
            id={'collapseFilterBoard-' + randString}
            className={'collapse mt-2' + (showFilter ? ' show' : '')}
          >
            <ColumnFilter
              columns={columns}
              filter={columnFilter}
              setFilter={(newFilters) => {
                setColumnFilter(newFilters)
                setStartViewIndex(0)
              }}
            />
          </div>
        )}
      </div>

      <div
        className={'d-flex flex-wrap mb-2'}
        style={{ marginRight: '-0.5rem' }}
      >
        {filteredContent.length === 0 && (
          <span className={'text-muted'}>Nothing could be found</span>
        )}
        {paginatedContent.map((content) =>
          renderSingleContent(
            content,
            false,
            canMove && editMode && updateContentURL !== '',
            editMode
          )
        )}
      </div>

      <Pagination
        contentLength={filteredContent.length}
        pageSize={pageSize}
        pageSizes={pageSizes}
        setPageSize={setPageSize}
        startViewIndex={startViewIndex}
        setStartViewIndex={setStartViewIndex}
      />

      {editMode && (
        <>
          <hr />
          <div
            className={'d-flex flex-wrap mb-2'}
            style={{ marginRight: '-0.5rem' }}
          >
            {filteredUnselectedContent.length === 0 && (
              <span className={'text-muted'}>
                There is nothing to be added anymore
              </span>
            )}
            {filteredUnselectedContent.map((i) =>
              renderSingleContent(i, true, false)
            )}
          </div>
        </>
      )}
      <CreateNewButton type={type} allowEdit={allowEdit} />
    </>
  )
}

export default Board
