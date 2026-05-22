declare module 'react-native-sqlite-storage' {
  namespace SQLite {
    interface ResultSet {
      insertId: number;
      rowsAffected: number;
      rows: {
        length: number;
        item(index: number): any;
      };
    }

    interface SQLiteDatabase {
      executeSql(sql: string, params?: any[]): Promise<[ResultSet]>;
      close(): Promise<void>;
    }
  }

  interface SQLiteStatic {
    enablePromise(enable: boolean): void;
    openDatabase(options: {
      name: string;
      location?: string;
    }): Promise<SQLite.SQLiteDatabase>;
  }

  const SQLite: SQLiteStatic;
  export = SQLite;
}
