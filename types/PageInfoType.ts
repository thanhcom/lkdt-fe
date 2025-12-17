export interface PageInfo {
  currentPage: number
  totalPage: number
  pageSize: number
  totalElement: number

  hasContent: boolean
  hasNext: boolean
  hasPrevious: boolean

  hashCode: number
  sortInfo: string

  empty: boolean
  first: boolean
  last: boolean
}
