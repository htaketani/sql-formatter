import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import { isToken, Token, TokenType } from '../core/token'; // convert to partial type import in TS 4.5
import type { StringPatternType } from '../core/regexFactory';
import { dedupe } from '../utils';

/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
const reservedKeywords = [
  // 'A',
  'ACCESSIBLE',
  'AGENT',
  'AGGREGATE',
  'ALL',
  'ALTER',
  'ANY',
  'ARRAY',
  'AS',
  'ASC',
  'AT',
  'ATTRIBUTE',
  'AUTHID',
  'AVG',
  'BETWEEN',
  'BFILE_BASE',
  'BINARY',
  'BINARY_INTEGER',
  'BLOB_BASE',
  'BLOCK',
  'BODY',
  'BOOLEAN',
  'BOTH',
  'BOUND',
  'BREADTH',
  'BULK',
  'BY',
  'BYTE',
  // 'C',
  'CALL',
  'CALLING',
  'CASCADE',
  'CAST',
  'CHAR',
  'CHARACTER',
  'CHARSET',
  'CHARSETFORM',
  'CHARSETID',
  'CHAR_BASE',
  'CHECK',
  'CLOB_BASE',
  'CLONE',
  'CLOSE',
  'CLUSTER',
  'CLUSTERS',
  'COALESCE',
  'COLAUTH',
  'COLLECT',
  'COLUMNS',
  'COMMENT',
  'COMMIT',
  'COMMITTED',
  'COMPILED',
  'COMPRESS',
  'CONNECT',
  'CONSTANT',
  'CONSTRUCTOR',
  'CONTEXT',
  'CONTINUE',
  'CONVERT',
  'COUNT',
  'CRASH',
  'CREATE',
  'CREDENTIAL',
  'CURRENT',
  'CURRVAL',
  'CURSOR',
  'CUSTOMDATUM',
  'DANGLING',
  'DATA',
  'DATE',
  'DATE_BASE',
  'DAY',
  'DECIMAL',
  'DEFAULT',
  'DEFINE',
  'DEPTH',
  'DESC',
  'DETERMINISTIC',
  'DIRECTORY',
  'DISTINCT',
  'DO',
  'DOUBLE',
  'DROP',
  'DURATION',
  'ELEMENT',
  'ELSIF',
  'EMPTY',
  'ESCAPE',
  'EXCEPTIONS',
  'EXCLUSIVE',
  'EXECUTE',
  'EXISTS',
  'EXIT',
  'EXTENDS',
  'EXTERNAL',
  'EXTRACT',
  'FALSE',
  'FETCH',
  'FINAL',
  'FIRST',
  'FIXED',
  'FLOAT',
  'FOR',
  'FORALL',
  'FORCE',
  'FUNCTION',
  'GENERAL',
  'GOTO',
  'GRANT',
  'GROUP',
  'HASH',
  'HEAP',
  'HIDDEN',
  'HOUR',
  'IDENTIFIED',
  'IF',
  'IMMEDIATE',
  'IN',
  'INCLUDING',
  'INDEX',
  'INDEXES',
  'INDICATOR',
  'INDICES',
  'INFINITE',
  'INSTANTIABLE',
  'INT',
  'INTEGER',
  'INTERFACE',
  'INTERVAL',
  'INTO',
  'INVALIDATE',
  'IS',
  'ISOLATION',
  'JAVA',
  'LANGUAGE',
  'LARGE',
  'LEADING',
  'LENGTH',
  'LEVEL',
  'LIBRARY',
  'LIKE',
  'LIKE2',
  'LIKE4',
  'LIKEC',
  'LIMITED',
  'LOCAL',
  'LOCK',
  'LONG',
  'MAP',
  'MAX',
  'MAXLEN',
  'MEMBER',
  'MERGE',
  'MIN',
  'MINUTE',
  'MLSLABEL',
  'MOD',
  'MODE',
  'MONTH',
  'MULTISET',
  'NAME',
  'NAN',
  'NATIONAL',
  'NATIVE',
  'NATURAL',
  'NATURALN',
  'NCHAR',
  'NEW',
  'NEXTVAL',
  'NOCOMPRESS',
  'NOCOPY',
  'NOT',
  'NOWAIT',
  'NULL',
  'NULLIF',
  'NUMBER',
  'NUMBER_BASE',
  'OBJECT',
  'OCICOLL',
  'OCIDATE',
  'OCIDATETIME',
  'OCIDURATION',
  'OCIINTERVAL',
  'OCILOBLOCATOR',
  'OCINUMBER',
  'OCIRAW',
  'OCIREF',
  'OCIREFCURSOR',
  'OCIROWID',
  'OCISTRING',
  'OCITYPE',
  'OF',
  'OLD',
  'ON DELETE',
  'ON UPDATE',
  'ONLY',
  'OPAQUE',
  'OPEN',
  'OPERATOR',
  'OPTION',
  'ORACLE',
  'ORADATA',
  'ORDER',
  'ORGANIZATION',
  'ORLANY',
  'ORLVARY',
  'OTHERS',
  'OUT',
  'OVERLAPS',
  'OVERRIDING',
  'PACKAGE',
  'PARALLEL_ENABLE',
  'PARAMETER',
  'PARAMETERS',
  'PARENT',
  'PARTITION',
  'PASCAL',
  'PCTFREE',
  'PIPE',
  'PIPELINED',
  'PLS_INTEGER',
  'PLUGGABLE',
  'POSITIVE',
  'POSITIVEN',
  'PRAGMA',
  'PRECISION',
  'PRIOR',
  'PRIVATE',
  'PROCEDURE',
  'PUBLIC',
  'RAISE',
  'RANGE',
  'RAW',
  'READ',
  'REAL',
  'RECORD',
  'REF',
  'REFERENCE',
  'RELEASE',
  'RELIES_ON',
  'REM',
  'REMAINDER',
  'RENAME',
  'RESOURCE',
  'RESULT',
  'RESULT_CACHE',
  'RETURN',
  'REVERSE',
  'REVOKE',
  'ROLLBACK',
  'ROW',
  'ROWID',
  'ROWNUM',
  'ROWTYPE',
  'SAMPLE',
  'SAVE',
  'SAVEPOINT',
  'SB1',
  'SB2',
  'SB4',
  'SEARCH',
  'SECOND',
  'SEGMENT',
  'SELF',
  'SEPARATE',
  'SEQUENCE',
  'SERIALIZABLE',
  'SHARE',
  'SHORT',
  'SIZE',
  'SIZE_T',
  'SMALLINT',
  'SOME',
  'SPACE',
  'SPARSE',
  'SQL',
  'SQLCODE',
  'SQLDATA',
  'SQLERRM',
  'SQLNAME',
  'SQLSTATE',
  'STANDARD',
  'START',
  'STATIC',
  'STDDEV',
  'STORED',
  'STRING',
  'STRUCT',
  'STYLE',
  'SUBMULTISET',
  'SUBPARTITION',
  'SUBSTITUTABLE',
  'SUBTYPE',
  'SUCCESSFUL',
  'SUM',
  'SYNONYM',
  'SYSDATE',
  'TABAUTH',
  'TABLE',
  'TDO',
  'THE',
  'THEN',
  'TIME',
  'TIMESTAMP',
  'TIMEZONE_ABBR',
  'TIMEZONE_HOUR',
  'TIMEZONE_MINUTE',
  'TIMEZONE_REGION',
  'TO',
  'TRAILING',
  'TRANSACTION',
  'TRANSACTIONAL',
  'TRIGGER',
  'TRUE',
  'TRUSTED',
  'TYPE',
  'UB1',
  'UB2',
  'UB4',
  'UID',
  'UNDER',
  'UNIQUE',
  'UNPLUG',
  'UNSIGNED',
  'UNTRUSTED',
  'USE',
  'USER',
  'VALIDATE',
  'VALIST',
  'VALUE',
  'VARCHAR',
  'VARCHAR2',
  'VARIABLE',
  'VARIANCE',
  'VARRAY',
  'VARYING',
  'VIEW',
  'VIEWS',
  'VOID',
  'WHENEVER',
  'WHILE',
  'WORK',
  'WRAPPED',
  'WRITE',
  'YEAR',
  'ZONE',
];

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
const reservedCommands = [
  'ADD',
  'ALTER COLUMN',
  'ALTER TABLE',
  'BEGIN',
  'CONNECT BY',
  'CREATE TABLE', // verify
  'DROP TABLE', // verify
  'DECLARE',
  'DELETE',
  'DELETE FROM',
  'END',
  'EXCEPT',
  'EXCEPTION',
  'FETCH FIRST',
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT INTO',
  'INSERT',
  'LIMIT',
  'OFFSET',
  'LOOP',
  'MODIFY',
  'ORDER BY',
  'RETURNING',
  'SELECT',
  'SET CURRENT SCHEMA',
  'SET SCHEMA',
  'SET',
  'START WITH',
  'UPDATE',
  'VALUES',
  'WHERE',
  'WITH',
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
  'EXCEPT',
  'EXCEPT ALL',
  'EXCEPT DISTINCT',
  'MINUS',
  'MINUS ALL',
  'MINUS DISTINCT',
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
  'NATURAL JOIN',
  // apply
  'CROSS APPLY',
  'OUTER APPLY',
];

/**
 * Priority 3
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['WHEN', 'ELSE'];

export default class PlSqlFormatter extends Formatter {
  static reservedCommands = reservedCommands;
  static reservedBinaryCommands = reservedBinaryCommands;
  static reservedDependentClauses = reservedDependentClauses;
  static reservedJoinConditions = ['ON', 'USING'];
  static reservedLogicalOperators = ['AND', 'OR', 'XOR'];
  static reservedKeywords = dedupe(reservedKeywords);
  static stringTypes: StringPatternType[] = [`""`, "N''", "''", '``'];
  static blockStart = ['(', 'CASE'];
  static blockEnd = [')', 'END'];
  static indexedPlaceholderTypes = ['?'];
  static namedPlaceholderTypes = [':'];
  static lineCommentTypes = ['--'];
  static specialWordChars = { any: '_$#.@' };
  static operators = [
    '||',
    '**',
    ':=',
    '~=',
    '^=',
    '>>',
    '<<',
    '=>',
    //  '..' // breaks operator test, handled by .
  ];

  tokenizer() {
    return new Tokenizer({
      reservedCommands: PlSqlFormatter.reservedCommands,
      reservedBinaryCommands: PlSqlFormatter.reservedBinaryCommands,
      reservedDependentClauses: PlSqlFormatter.reservedDependentClauses,
      reservedJoinConditions: PlSqlFormatter.reservedJoinConditions,
      reservedLogicalOperators: PlSqlFormatter.reservedLogicalOperators,
      reservedKeywords: PlSqlFormatter.reservedKeywords,
      stringTypes: PlSqlFormatter.stringTypes,
      blockStart: PlSqlFormatter.blockStart,
      blockEnd: PlSqlFormatter.blockEnd,
      indexedPlaceholderTypes: PlSqlFormatter.indexedPlaceholderTypes,
      namedPlaceholderTypes: PlSqlFormatter.namedPlaceholderTypes,
      lineCommentTypes: PlSqlFormatter.lineCommentTypes,
      specialWordChars: PlSqlFormatter.specialWordChars,
      operators: PlSqlFormatter.operators,
    });
  }

  tokenOverride(token: Token) {
    // `table`[.]`column`
    if (
      token.value === '.' &&
      this.tokenLookAhead().value.startsWith('`') &&
      this.tokenLookBehind().value.endsWith('`')
    ) {
      // This is an operator, do not insert spaces
      return { type: TokenType.OPERATOR, value: token.value };
    }

    // BY [SET]
    if (isToken.SET(token) && isToken.BY(this.getPreviousReservedToken())) {
      return { type: TokenType.RESERVED_KEYWORD, value: token.value };
    }

    return token;
  }
}
