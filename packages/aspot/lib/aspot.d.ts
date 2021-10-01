export * from './match';
declare const aspot: () => import("./basicStoreNode").StoreNode & {
    node: (subject: any) => import("./subjectNode").SubjectNode<import("./basicStoreNode").StoreNode>;
    find: (match: import("./basicStoreNode").Match, name?: string) => import("./resultNode").ResultNode<import("./basicStoreNode").StoreNode>;
};
declare const aspotLocal: (name: string) => import("./basicStoreNode").StoreNode & {
    node: (subject: any) => import("./subjectNode").SubjectNode<import("./basicStoreNode").StoreNode>;
    find: (match: import("./basicStoreNode").Match, name?: string) => import("./resultNode").ResultNode<import("./basicStoreNode").StoreNode>;
};
export { aspot, aspotLocal, };
