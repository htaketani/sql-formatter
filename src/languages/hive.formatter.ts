import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import type { StringPatternType } from '../core/regexFactory';
import { dedupe } from '../utils';

/**
 * Priority 5 (last)
 * Full list of reserved functions
 * distinct from Keywords due to interaction with parentheses
 */
// https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF
const reservedFunctions = {
  math: [
    'ABS',
    'ACOS',
    'ASIN',
    'ATAN',
    'BIN',
    'BROUND',
    'CBRT',
    'CEIL',
    'CEILING',
    'CONV',
    'COS',
    'DEGREES',
    // 'E',
    'EXP',
    'FACTORIAL',
    'FLOOR',
    'GREATEST',
    'HEX',
    'LEAST',
    'LN',
    'LOG',
    'LOG10',
    'LOG2',
    'NEGATIVE',
    'PI',
    'PMOD',
    'POSITIVE',
    'POW',
    'POWER',
    'RADIANS',
    'RAND',
    'ROUND',
    'SHIFTLEFT',
    'SHIFTRIGHT',
    'SHIFTRIGHTUNSIGNED',
    'SIGN',
    'SIN',
    'SQRT',
    'TAN',
    'UNHEX',
    'WIDTH_BUCKET',
  ],
  array: ['ARRAY_CONTAINS', 'MAP_KEYS', 'MAP_VALUES', 'SIZE', 'SORT_ARRAY'],
  conversion: ['BINARY', 'CAST'],
  date: [
    'ADD_MONTHS',
    'DATE',
    'DATE_ADD',
    'DATE_FORMAT',
    'DATE_SUB',
    'DATEDIFF',
    'DAY',
    'DAYNAME',
    'DAYOFMONTH',
    'DAYOFYEAR',
    'EXTRACT',
    'FROM_UNIXTIME',
    'FROM_UTC_TIMESTAMP',
    'HOUR',
    'LAST_DAY',
    'MINUTE',
    'MONTH',
    'MONTHS_BETWEEN',
    'NEXT_DAY',
    'QUARTER',
    'SECOND',
    'TIMESTAMP',
    'TO_DATE',
    'TO_UTC_TIMESTAMP',
    'TRUNC',
    'UNIX_TIMESTAMP',
    'WEEKOFYEAR',
    'YEAR',
  ],
  conditional: ['ASSERT_TRUE', 'COALESCE', 'IF', 'ISNOTNULL', 'ISNULL', 'NULLIF', 'NVL'],
  string: [
    'ASCII',
    'BASE64',
    'CHARACTER_LENGTH',
    'CHR',
    'CONCAT',
    'CONCAT_WS',
    'CONTEXT_NGRAMS',
    'DECODE',
    'ELT',
    'ENCODE',
    'FIELD',
    'FIND_IN_SET',
    'FORMAT_NUMBER',
    'GET_JSON_OBJECT',
    'IN_FILE',
    'INITCAP',
    'INSTR',
    'LCASE',
    'LENGTH',
    'LEVENSHTEIN',
    'LOCATE',
    'LOWER',
    'LPAD',
    'LTRIM',
    'NGRAMS',
    'OCTET_LENGTH',
    'PARSE_URL',
    'PRINTF',
    'QUOTE',
    'REGEXP_EXTRACT',
    'REGEXP_REPLACE',
    'REPEAT',
    'REVERSE',
    'RPAD',
    'RTRIM',
    'SENTENCES',
    'SOUNDEX',
    'SPACE',
    'SPLIT',
    'STR_TO_MAP',
    'SUBSTR',
    'SUBSTRING',
    'TRANSLATE',
    'TRIM',
    'UCASE',
    'UNBASE64',
    'UPPER',
  ],
  masking: [
    'MASK',
    'MASK_FIRST_N',
    'MASK_HASH',
    'MASK_LAST_N',
    'MASK_SHOW_FIRST_N',
    'MASK_SHOW_LAST_N',
  ],
  misc: [
    'AES_DECRYPT',
    'AES_ENCRYPT',
    'CRC32',
    'CURRENT_DATABASE',
    'CURRENT_USER',
    'HASH',
    'JAVA_METHOD',
    'LOGGED_IN_USER',
    'MD5',
    'REFLECT',
    'SHA',
    'SHA1',
    'SHA2',
    'SURROGATE_KEY',
    'VERSION',
  ],
  aggregate: [
    'AVG',
    'COLLECT_LIST',
    'COLLECT_SET',
    'CORR',
    'COUNT',
    'COVAR_POP',
    'COVAR_SAMP',
    'HISTOGRAM_NUMERIC',
    'MAX',
    'MIN',
    'NTILE',
    'PERCENTILE',
    'PERCENTILE_APPROX',
    'REGR_AVGX',
    'REGR_AVGY',
    'REGR_COUNT',
    'REGR_INTERCEPT',
    'REGR_R2',
    'REGR_SLOPE',
    'REGR_SXX',
    'REGR_SXY',
    'REGR_SYY',
    'STDDEV_POP',
    'STDDEV_SAMP',
    'SUM',
    'VAR_POP',
    'VAR_SAMP',
    'VARIANCE',
  ],
  table: ['EXPLODE', 'INLINE', 'JSON_TUPLE', 'PARSE_URL_TUPLE', 'POSEXPLODE', 'STACK'],
};

/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
// https://cwiki.apache.org/confluence/display/hive/languagemanual+ddl
const reservedKeywords = {
  // Non-reserved keywords have proscribed meanings in. HiveQL, but can still be used as table or column names
  nonReserved: [
    'ADD',
    'ADMIN',
    'AFTER',
    'ANALYZE',
    'ARCHIVE',
    'ASC',
    'BEFORE',
    'BUCKET',
    'BUCKETS',
    'CASCADE',
    'CHANGE',
    'CLUSTER',
    'CLUSTERED',
    'CLUSTERSTATUS',
    'COLLECTION',
    'COLUMNS',
    'COMMENT',
    'COMPACT',
    'COMPACTIONS',
    'COMPUTE',
    'CONCATENATE',
    'CONTINUE',
    'DATA',
    'DATABASES',
    'DATETIME',
    'DAY',
    'DBPROPERTIES',
    'DEFERRED',
    'DEFINED',
    'DELIMITED',
    'DEPENDENCY',
    'DESC',
    'DIRECTORIES',
    'DIRECTORY',
    'DISABLE',
    'DISTRIBUTE',
    'ELEM_TYPE',
    'ENABLE',
    'ESCAPED',
    'EXCLUSIVE',
    'EXPLAIN',
    'EXPORT',
    'FIELDS',
    'FILE',
    'FILEFORMAT',
    'FIRST',
    'FORMAT',
    'FORMATTED',
    'FUNCTIONS',
    'HOLD_DDLTIME',
    'HOUR',
    'IDXPROPERTIES',
    'IGNORE',
    'INDEX',
    'INDEXES',
    'INPATH',
    'INPUTDRIVER',
    'INPUTFORMAT',
    'ITEMS',
    'JAR',
    'KEYS',
    'KEY_TYPE',
    'LIMIT',
    'LINES',
    'LOAD',
    'LOCATION',
    'LOCK',
    'LOCKS',
    'LOGICAL',
    'LONG',
    'MAPJOIN',
    'MATERIALIZED',
    'METADATA',
    'MINUS',
    'MINUTE',
    'MONTH',
    'MSCK',
    'NOSCAN',
    'NO_DROP',
    'OFFLINE',
    'OPTION',
    'OUTPUTDRIVER',
    'OUTPUTFORMAT',
    'OVERWRITE',
    'OWNER',
    'PARTITIONED',
    'PARTITIONS',
    'PLUS',
    'PRETTY',
    'PRINCIPALS',
    'PROTECTION',
    'PURGE',
    'READ',
    'READONLY',
    'REBUILD',
    'RECORDREADER',
    'RECORDWRITER',
    'RELOAD',
    'RENAME',
    'REPAIR',
    'REPLACE',
    'REPLICATION',
    'RESTRICT',
    'REWRITE',
    'ROLE',
    'ROLES',
    'SCHEMA',
    'SCHEMAS',
    'SECOND',
    'SEMI',
    'SERDE',
    'SERDEPROPERTIES',
    'SERVER',
    'SETS',
    'SHARED',
    'SHOW',
    'SHOW_DATABASE',
    'SKEWED',
    'SORT',
    'SORTED',
    'SSL',
    'STATISTICS',
    'STORED',
    'STREAMTABLE',
    'STRING',
    'STRUCT',
    'TABLES',
    'TBLPROPERTIES',
    'TEMPORARY',
    'TERMINATED',
    'TINYINT',
    'TOUCH',
    'TRANSACTIONS',
    'UNARCHIVE',
    'UNDO',
    'UNIONTYPE',
    'UNLOCK',
    'UNSET',
    'UNSIGNED',
    'URI',
    // 'USE',
    'UTC',
    'UTCTIMESTAMP',
    'VALUE_TYPE',
    'VIEW',
    'WHILE',
    'YEAR',
    'AUTOCOMMIT',
    'ISOLATION',
    'LEVEL',
    'OFFSET',
    'SNAPSHOT',
    'TRANSACTION',
    'WORK',
    'WRITE',
    'ABORT',
    'KEY',
    'LAST',
    'NORELY',
    'NOVALIDATE',
    'NULLS',
    'RELY',
    'VALIDATE',
    'DETAIL',
    'DOW',
    'EXPRESSION',
    'OPERATOR',
    'QUARTER',
    'SUMMARY',
    'VECTORIZATION',
    'WEEK',
    'YEARS',
    'MONTHS',
    'WEEKS',
    'DAYS',
    'HOURS',
    'MINUTES',
    'SECONDS',
    'TIMESTAMPTZ',
    'ZONE',
  ],
  reserved: [
    // reserved
    'ALL',
    // 'ALTER',
    // 'AND',
    'ARRAY',
    'AS',
    'AUTHORIZATION',
    'BETWEEN',
    'BIGINT',
    'BINARY',
    'BOOLEAN',
    'BOTH',
    'BY',
    // 'CASE',
    'CAST',
    'CHAR',
    'COLUMN',
    'CONF',
    // 'CREATE',
    'CROSS',
    'CUBE',
    'CURRENT',
    'CURRENT_DATE',
    'CURRENT_TIMESTAMP',
    'CURSOR',
    'DATABASE',
    'DATE',
    'DECIMAL',
    'DELETE',
    // 'DESCRIBE',
    'DISTINCT',
    'DOUBLE',
    // 'DROP',
    // 'ELSE',
    // 'END',
    'EXCHANGE',
    'EXISTS',
    'EXTENDED',
    'EXTERNAL',
    'FALSE',
    // 'FETCH',
    'FLOAT',
    'FOLLOWING',
    'FOR',
    // 'FROM',
    'FULL',
    'FUNCTION',
    'GRANT',
    // 'GROUP',
    'GROUPING',
    // 'HAVING',
    'IF',
    'IMPORT',
    'IN',
    'INNER',
    // 'INSERT',
    'INT',
    // 'INTERSECT',
    'INTERVAL',
    'INTO',
    'IS',
    // 'JOIN',
    'LATERAL',
    'LEFT',
    'LESS',
    'LIKE',
    'LOCAL',
    'MACRO',
    'MAP',
    'MORE',
    'NONE',
    'NOT',
    'NULL',
    'OF',
    // 'ON',
    // 'OR',
    'ORDER',
    'OUT',
    'OUTER',
    'OVER',
    'PARTIALSCAN',
    'PARTITION',
    'PERCENT',
    'PRECEDING',
    'PRESERVE',
    'PROCEDURE',
    'RANGE',
    'READS',
    'REDUCE',
    'REVOKE',
    'RIGHT',
    'ROLLUP',
    'ROW',
    'ROWS',
    // 'SELECT',
    'SET',
    'SMALLINT',
    'TABLE',
    'TABLESAMPLE',
    'THEN',
    'TIMESTAMP',
    'TO',
    'TRANSFORM',
    'TRIGGER',
    'TRUE',
    // 'TRUNCATE',
    'UNBOUNDED',
    // 'UNION',
    'UNIQUEJOIN',
    // 'UPDATE',
    'USER',
    'UTC_TMESTAMP',
    // 'VALUES',
    'VARCHAR',
    // 'WHEN',
    // 'WHERE',
    'WINDOW',
    // 'WITH',
    'COMMIT',
    'ONLY',
    'REGEXP',
    'RLIKE',
    'ROLLBACK',
    'START',
    'CACHE',
    'CONSTRAINT',
    'FOREIGN',
    'PRIMARY',
    'REFERENCES',
    'DAYOFWEEK',
    'EXTRACT',
    'FLOOR',
    'INTEGER',
    'PRECISION',
    'VIEWS',
    'TIME',
    'NUMERIC',
    'SYNC',
  ],
  fileTypes: [
    'TEXTFILE',
    'SEQUENCEFILE',
    'ORC',
    'CSV',
    'TSV',
    'PARQUET',
    'AVRO',
    'RCFILE',
    'JSONFILE',
    'INPUTFORMAT',
    'OUTPUTFORMAT',
  ],
};

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
const reservedCommands = [
  // commands
  'ALTER',
  'ALTER COLUMN', // added
  'ALTER TABLE', // added
  'CREATE',
  'CREATE TABLE', // added
  'USE',
  'DESCRIBE',
  'DROP',
  'DROP TABLE', // added
  'FETCH',
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT',
  'INSERT INTO', // added
  'LIMIT',
  'OFFSET',
  'ORDER BY',
  'SELECT',
  'SET',
  'SET SCHEMA', // added
  'SHOW',
  'SORT BY',
  'TRUNCATE',
  'UPDATE',
  'VALUES',
  'WHERE',
  'WITH',

  // newline keywords
  'STORED AS',
  'STORED BY',
  'ROW FORMAT',
];

/**
 * Priority 2
 * commands that operate on two tables or subqueries
 * two main categories: joins and boolean set operators
 */
const reservedBinaryCommands = [
  // set booleans
  'INTERSECT',
  'INTERSECT ALL',
  'INTERSECT DISTINCT',
  'UNION',
  'UNION ALL',
  'UNION DISTINCT',
  // joins
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
  'FULL JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
];

/**
 * Priority 3
 * keywords that follow a previous 'Statement', must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['WHEN', 'ELSE'];

// https://cwiki.apache.org/confluence/display/Hive/LanguageManual
export default class HiveFormatter extends Formatter {
  static reservedCommands = reservedCommands;
  static reservedBinaryCommands = reservedBinaryCommands;
  static reservedDependentClauses = reservedDependentClauses;
  static reservedJoinConditions = ['ON', 'USING'];
  static reservedLogicalOperators = ['AND', 'OR'];
  static fullReservedWords = dedupe([
    ...Object.values(reservedFunctions).reduce((acc, arr) => [...acc, ...arr], []),
    ...Object.values(reservedKeywords).reduce((acc, arr) => [...acc, ...arr], []),
  ]);

  static stringTypes: StringPatternType[] = ['""', "''", '``'];
  static blockStart = ['(', 'CASE'];
  static blockEnd = [')', 'END'];
  static indexedPlaceholderTypes = ['?'];
  static namedPlaceholderTypes = [];
  static lineCommentTypes = ['--'];
  static specialWordChars = {};
  static operators = ['<=>', '==', '||'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands: HiveFormatter.reservedCommands,
      reservedBinaryCommands: HiveFormatter.reservedBinaryCommands,
      reservedDependentClauses: HiveFormatter.reservedDependentClauses,
      reservedJoinConditions: HiveFormatter.reservedJoinConditions,
      reservedLogicalOperators: HiveFormatter.reservedLogicalOperators,
      reservedKeywords: HiveFormatter.fullReservedWords,
      stringTypes: HiveFormatter.stringTypes,
      blockStart: HiveFormatter.blockStart,
      blockEnd: HiveFormatter.blockEnd,
      indexedPlaceholderTypes: HiveFormatter.indexedPlaceholderTypes,
      namedPlaceholderTypes: HiveFormatter.namedPlaceholderTypes,
      lineCommentTypes: HiveFormatter.lineCommentTypes,
      specialWordChars: HiveFormatter.specialWordChars,
      operators: HiveFormatter.operators,
    });
  }
}
