import Head from 'next/head'
import {
  getLibrariesWithCollections,
  getLibrary,
} from '../../../lib/db/libraries'
import { getCollections } from '../../../lib/db/collections'
import EditLibrary from '../../../components/edit/EditLibrary'
import Link from 'next/link'
import CollectionBoard from '../../../components/boards/CollectionBoard'
import ViewAllButton from '../../../components/buttons/ViewAllButton'

export default function EditorLibrary({
  _id,
  libraries,
  collections,
  library,
}) {
  return (
    <>
      <Head>
        <title>
          {(_id === '_new' ? 'Create tab' : 'Editlibrary' + library.name) +
            ' | ' +
            process.env.NEXT_PUBLIC_SITE_NAME}
        </title>
      </Head>

      <div className={'d-flex justify-content-between'}>
        <h2>
          {_id === '_new' ? (
            'Create a new library'
          ) : (
            <>
              Edit library{' '}
              <Link href={'/library/' + library.urlId}>{library.name}</Link>
            </>
          )}
        </h2>
        <div>
          <ViewAllButton type={'libraries'} />
        </div>
      </div>
      {_id !== '_new' ? (
        <small className={'text-muted'}>
          ID: <code>{library._id}</code>
        </small>
      ) : (
        <></>
      )}

      <div className={'card bg-2 mb-3'}>
        <div className='card-body'>
          {_id === '_new' ? (
            <EditLibrary
              libraries={libraries}
              collectionsDatalist={collections}
            />
          ) : (
            <EditLibrary
              libraries={libraries}
              collectionsDatalist={collections}
              _id={library._id}
              urlId={library.urlId}
              name={library.name}
              img={library.img}
              nsfw={library.nsfw}
              description={library.description}
              collections={library.collections}
            />
          )}
        </div>
      </div>

      <h4>Collections used in this library</h4>
      {_id !== '_new' ? (
        <CollectionBoard
          _id={library._id}
          collections={library.collections}
          allCollections={collections}
          canMove={false}
          canEdit={true}
          forceEditMode={true}
        />
      ) : (
        <div className={'text-muted'}>
          Collection selection will be available once the library has been
          created
        </div>
      )}
    </>
  )
}

EditorLibrary.auth = {
  requireEditor: true,
}

export async function getServerSideProps({ params }) {
  let library = {}
  if (params.id !== '_new') {
    library = await getLibrary(params.id)
    if (!library) {
      return {
        notFound: true,
      }
    }
  }

  return {
    props: {
      _id: params.id,
      libraries: await getLibrariesWithCollections(),
      collections: await getCollections(),
      library,
    },
  }
}