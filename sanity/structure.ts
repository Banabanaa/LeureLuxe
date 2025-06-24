import type {StructureResolver} from 'sanity/structure'
import Dashboard from './components/Dashboard'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Dashboard')
        .icon(() => '📊')
        .child(
          S.component()
            .title('Dashboard')
            .component(Dashboard)
        ),
      ...S.documentTypeListItems()
    ])