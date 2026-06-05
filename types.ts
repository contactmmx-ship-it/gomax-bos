export interface SopPage {
  /** Page Title (e.g. "Institutional Objective") */
  t: string;
  /** Page Content documentation text */
  c: string;
}

export interface SopModule {
  /** SOP ID (e.g., "SOP 01") */
  id: string;
  /** Name of the SOP (e.g., "Daily Sales Review Meeting") */
  title: string;
  /** Associated department (e.g., "SALES MANAGEMENT") */
  dept: string;
  /** Set of 6 structured clauses or pages */
  pages: SopPage[];
}
