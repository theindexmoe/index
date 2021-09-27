import { getCollections } from '../../lib/db/collections'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/client'
import { canEdit } from '../../lib/session'
import IconEdit from '../../components/icons/IconEdit'
import ItemBoard from '../../components/boards/ItemBoard'
import useSWR from 'swr'
import { getByUrlId } from '../../lib/db/db'
import { getLibraries } from '../../lib/db/libraries'
import ViewAllButton from '../../components/buttons/ViewAllButton'
import IconCollection from '../../components/icons/IconCollection'
import IconNSFW from '../../components/icons/IconNSFW'

export default function Collection({
  _id,
  collection: staticCollection,
  libraries: staticLibraries,
}) {
  const [session] = useSession()
  let { data: collection } = useSWR('/api/collection/' + _id)
  let { data: libraries } = useSWR('/api/libraries')

  collection = collection || staticCollection
  libraries = libraries || staticLibraries

  const librariesContainingCollection = libraries.filter((library) =>
    library.collections.some((t) => t._id === collection._id)
  )

  const title =
    'Collection ' + collection.name + ' on ' + process.env.NEXT_PUBLIC_SITE_NAME
  return (
    <>
      <Head>
        <title>
          {collection.name + ' | ' + process.env.NEXT_PUBLIC_SITE_NAME}
        </title>

        <meta property='og:title' content={title} />
        <meta name='twitter:title' content={title} />

        <meta name='description' content={collection.description} />
        <meta property='og:description' content={collection.description} />
        <meta name='twitter:description' content={collection.description} />

        <meta
          name='twitter:image'
          content={process.env.NEXT_PUBLIC_DOMAIN + '/img/' + collection.img}
        />
        <meta
          property='og:image'
          content={process.env.NEXT_PUBLIC_DOMAIN + '/img/' + collection.img}
        />
      </Head>

      <div className={'row'} style={{ marginTop: '4rem' }}>
        <div className={'col-auto'}>
          <div className={'d-absolute mb-2'} style={{ marginTop: '-3.2rem' }}>
            <Image
              src={'/img/' + collection.img}
              alt={'Image of collection'}
              width={'148px'}
              height={'148px'}
              className={'rounded-circle bg-6'}
            />
          </div>
        </div>
        <div className={'col'}>
          <div className={'row'}>
            <div className={'col'}>
              <h2>
                <IconCollection /> {collection.name}
                {canEdit(session) ? (
                  <Link href={'/edit/collection/' + collection._id}>
                    <a title={'Edit collection'} className={'ms-2'}>
                      <IconEdit />
                    </a>
                  </Link>
                ) : (
                  <></>
                )}
              </h2>
            </div>
            <div className={'col-12 col-md-auto mb-2'}>
              {collection.nsfw ? <IconNSFW /> : <></>}
              <span className={'ms-2'}>
                <ViewAllButton type={'collections'} />
              </span>
            </div>
          </div>
          <div>
            {librariesContainingCollection.map((t) => {
              return (
                <Link href={'/library/' + t.urlId} key={t._id}>
                  <a title={'View library' + t.name}>
                    <div className={'badge rounded-pill bg-primary mb-2 me-2'}>
                      {t.name}
                    </div>
                  </a>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <p
        style={{
          whiteSpace: 'pre-line',
        }}
      >
        {collection.description}
      </p>

      <ItemBoard
        _id={collection._id}
        items={collection.items}
        columns={collection.columns}
        key={collection._id}
        canEdit={canEdit(session)}
      />
    </>
  )
}

export async function getStaticPaths() {
  const collections = await getCollections()
  const paths = collections.map((collection) => {
    return {
      params: {
        id: collection.urlId,
      },
    }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const collection = await getByUrlId('collections', params.id)
  if (!collection) {
    return {
      notFound: true,
      revalidate: 30,
    }
  }

  return {
    props: {
      _id: collection._id,
      collection,
      libraries: await getLibraries(),
    },
    revalidate: 30,
  }
}