import React, { useMemo, useRef, useState, useEffect } from 'react';

var ViewMode;

(function (ViewMode) {
  ViewMode["Hour"] = "Hour";
  ViewMode["QuarterDay"] = "Quarter Day";
  ViewMode["HalfDay"] = "Half Day";
  ViewMode["Day"] = "Day";
  ViewMode["Week"] = "Week";
  ViewMode["Month"] = "Month";
})(ViewMode || (ViewMode = {}));

const intlDTCache = {};
const getCachedDateTimeFormat = (locString, opts = {}) => {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];

  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }

  return dtf;
};
const addToDate = (date, quantity, scale) => {
  const newDate = new Date(date.getFullYear() + (scale === "year" ? quantity : 0), date.getMonth() + (scale === "month" ? quantity : 0), date.getDate() + (scale === "day" ? quantity : 0), date.getHours() + (scale === "hour" ? quantity : 0), date.getMinutes() + (scale === "minute" ? quantity : 0), date.getSeconds() + (scale === "second" ? quantity : 0), date.getMilliseconds() + (scale === "millisecond" ? quantity : 0));
  return newDate;
};
const startOfDate = (date, scale) => {
  const scores = ["millisecond", "second", "minute", "hour", "day", "month", "year"];

  const shouldReset = _scale => {
    const maxScore = scores.indexOf(scale);
    return scores.indexOf(_scale) <= maxScore;
  };

  const newDate = new Date(date.getFullYear(), shouldReset("year") ? 0 : date.getMonth(), shouldReset("month") ? 1 : date.getDate(), shouldReset("day") ? 0 : date.getHours(), shouldReset("hour") ? 0 : date.getMinutes(), shouldReset("minute") ? 0 : date.getSeconds(), shouldReset("second") ? 0 : date.getMilliseconds());
  return newDate;
};
const ganttDateRange = (tasks, viewMode) => {
  let newStartDate = tasks[0].start;
  let newEndDate = tasks[0].start;

  for (const task of tasks) {
    if (task.start < newStartDate) {
      newStartDate = task.start;
    }

    if (task.end > newEndDate) {
      newEndDate = task.end;
    }
  }

  switch (viewMode) {
    case ViewMode.Month:
      newStartDate = addToDate(newStartDate, -1, "month");
      newStartDate = startOfDate(newStartDate, "month");
      newEndDate = addToDate(newEndDate, 1, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;

    case ViewMode.Week:
      newStartDate = startOfDate(newStartDate, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newStartDate = addToDate(getMonday(newStartDate), -7, "day");
      newEndDate = addToDate(newEndDate, 1.5, "month");
      break;

    case ViewMode.Day:
      newStartDate = startOfDate(newStartDate, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newStartDate = addToDate(newStartDate, -1, "day");
      newEndDate = addToDate(newEndDate, 19, "day");
      break;

    case ViewMode.QuarterDay:
      newStartDate = startOfDate(newStartDate, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newStartDate = addToDate(newStartDate, -1, "day");
      newEndDate = addToDate(newEndDate, 66, "hour");
      break;

    case ViewMode.HalfDay:
      newStartDate = startOfDate(newStartDate, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newStartDate = addToDate(newStartDate, -1, "day");
      newEndDate = addToDate(newEndDate, 108, "hour");
      break;

    case ViewMode.Hour:
      newStartDate = startOfDate(newStartDate, "hour");
      newEndDate = startOfDate(newEndDate, "day");
      newStartDate = addToDate(newStartDate, -1, "hour");
      newEndDate = addToDate(newEndDate, 1, "day");
      break;
  }

  return [newStartDate, newEndDate];
};
const seedDates = (startDate, endDate, viewMode) => {
  let currentDate = new Date(startDate);
  const dates = [currentDate];

  while (currentDate < endDate) {
    switch (viewMode) {
      case ViewMode.Month:
        currentDate = addToDate(currentDate, 1, "month");
        break;

      case ViewMode.Week:
        currentDate = addToDate(currentDate, 7, "day");
        break;

      case ViewMode.Day:
        currentDate = addToDate(currentDate, 1, "day");
        break;

      case ViewMode.HalfDay:
        currentDate = addToDate(currentDate, 12, "hour");
        break;

      case ViewMode.QuarterDay:
        currentDate = addToDate(currentDate, 6, "hour");
        break;

      case ViewMode.Hour:
        currentDate = addToDate(currentDate, 1, "hour");
        break;
    }

    dates.push(currentDate);
  }

  return dates;
};
const getLocaleMonth = (date, locale) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    month: "long"
  }).format(date);
  bottomValue = bottomValue.replace(bottomValue[0], bottomValue[0].toLocaleUpperCase());
  return bottomValue;
};
const getLocalDayOfWeek = (date, locale, format) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    weekday: format
  }).format(date);
  bottomValue = bottomValue.replace(bottomValue[0], bottomValue[0].toLocaleUpperCase());
  return bottomValue;
};

const getMonday = date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekNumberISO8601 = date => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);

  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + (4 - tmpDate.getDay() + 7) % 7);
  }

  const weekNumber = (1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  } else {
    return weekNumber;
  }
};
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

var styles = {"ganttTable":"_task-list-header-module__ganttTable__3_ygE","ganttTable_Header":"_task-list-header-module__ganttTable_Header__1nBOt","ganttTable_HeaderSeparator":"_task-list-header-module__ganttTable_HeaderSeparator__2eZzQ","ganttTable_HeaderItem":"_task-list-header-module__ganttTable_HeaderItem__WuQ0f"};

const TaskListHeaderDefault = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth
}) => {
  return React.createElement("div", {
    className: styles.ganttTable,
    style: {
      fontFamily: fontFamily,
      fontSize: fontSize
    }
  }, React.createElement("div", {
    className: styles.ganttTable_Header,
    style: {
      height: headerHeight - 2
    }
  }, React.createElement("div", {
    className: styles.ganttTable_HeaderItem,
    style: {
      minWidth: rowWidth
    }
  }, "\u00A0Name"), React.createElement("div", {
    className: styles.ganttTable_HeaderSeparator,
    style: {
      height: headerHeight * 0.5,
      marginTop: headerHeight * 0.2
    }
  }), React.createElement("div", {
    className: styles.ganttTable_HeaderItem,
    style: {
      minWidth: rowWidth
    }
  }, "\u00A0From"), React.createElement("div", {
    className: styles.ganttTable_HeaderSeparator,
    style: {
      height: headerHeight * 0.5,
      marginTop: headerHeight * 0.25
    }
  }), React.createElement("div", {
    className: styles.ganttTable_HeaderItem,
    style: {
      minWidth: rowWidth
    }
  }, "\u00A0To")));
};

var styles$1 = {"taskListWrapper":"_task-list-table-module__taskListWrapper__3ZbQT","taskListTableRow":"_task-list-table-module__taskListTableRow__34SS0","taskListCell":"_task-list-table-module__taskListCell__3lLk3","taskListNameWrapper":"_task-list-table-module__taskListNameWrapper__nI1Xw","taskListExpander":"_task-list-table-module__taskListExpander__2QjE6","taskListEmptyExpander":"_task-list-table-module__taskListEmptyExpander__2TfEi"};

const localeDateStringCache = {};

const toLocaleDateStringFactory = locale => (date, dateTimeOptions) => {
  const key = date.toString();
  let lds = localeDateStringCache[key];

  if (!lds) {
    lds = date.toLocaleDateString(locale, dateTimeOptions);
    localeDateStringCache[key] = lds;
  }

  return lds;
};

const dateTimeOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric"
};
const TaskListTableDefault = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick
}) => {
  const toLocaleDateString = useMemo(() => toLocaleDateStringFactory(locale), [locale]);
  return React.createElement("div", {
    className: styles$1.taskListWrapper,
    style: {
      fontFamily: fontFamily,
      fontSize: fontSize
    }
  }, tasks.map(t => {
    let expanderSymbol = "";

    if (t.hideChildren === false) {
      expanderSymbol = "▼";
    } else if (t.hideChildren === true) {
      expanderSymbol = "▶";
    }

    return React.createElement("div", {
      className: styles$1.taskListTableRow,
      style: {
        height: rowHeight
      },
      key: `${t.id}row`
    }, React.createElement("div", {
      className: styles$1.taskListCell,
      style: {
        minWidth: rowWidth,
        maxWidth: rowWidth
      },
      title: t.name
    }, React.createElement("div", {
      className: styles$1.taskListNameWrapper
    }, React.createElement("div", {
      className: expanderSymbol ? styles$1.taskListExpander : styles$1.taskListEmptyExpander,
      onClick: () => onExpanderClick(t)
    }, expanderSymbol), React.createElement("div", null, t.name))), React.createElement("div", {
      className: styles$1.taskListCell,
      style: {
        minWidth: rowWidth,
        maxWidth: rowWidth
      }
    }, "\u00A0", toLocaleDateString(t.start, dateTimeOptions)), React.createElement("div", {
      className: styles$1.taskListCell,
      style: {
        minWidth: rowWidth,
        maxWidth: rowWidth
      }
    }, "\u00A0", toLocaleDateString(t.end, dateTimeOptions)));
  }));
};

var styles$2 = {"tooltipDefaultContainer":"_tooltip-module__tooltipDefaultContainer__3T42e","tooltipDefaultContainerParagraph":"_tooltip-module__tooltipDefaultContainerParagraph__29NTg","tooltipDetailsContainer":"_tooltip-module__tooltipDetailsContainer__25P-K","tooltipDetailsContainerHidden":"_tooltip-module__tooltipDetailsContainerHidden__3gVAq"};

const Tooltip = ({
  task,
  rowHeight,
  rtl,
  svgContainerHeight,
  svgContainerWidth,
  scrollX,
  scrollY,
  arrowIndent,
  fontSize,
  fontFamily,
  headerHeight,
  taskListWidth,
  TooltipContent
}) => {
  const tooltipRef = useRef(null);
  const [relatedY, setRelatedY] = useState(0);
  const [relatedX, setRelatedX] = useState(0);
  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;
      let newRelatedY = task.index * rowHeight - scrollY + headerHeight;
      let newRelatedX;

      if (rtl) {
        newRelatedX = task.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX;

        if (newRelatedX < 0) {
          newRelatedX = task.x2 + arrowIndent * 1.5 - scrollX;
        }

        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;

        if (tooltipLeftmostPoint > svgContainerWidth) {
          newRelatedX = svgContainerWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      } else {
        newRelatedX = task.x2 + arrowIndent * 1.5 + taskListWidth - scrollX;
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        const fullChartWidth = taskListWidth + svgContainerWidth;

        if (tooltipLeftmostPoint > fullChartWidth) {
          newRelatedX = task.x1 + taskListWidth - arrowIndent * 1.5 - scrollX - tooltipWidth;
        }

        if (newRelatedX < taskListWidth) {
          newRelatedX = svgContainerWidth + taskListWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      }

      const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY;

      if (tooltipLowerPoint > svgContainerHeight - scrollY) {
        newRelatedY = svgContainerHeight - tooltipHeight;
      }

      setRelatedY(newRelatedY);
      setRelatedX(newRelatedX);
    }
  }, [tooltipRef.current, task, arrowIndent, scrollX, scrollY, headerHeight, taskListWidth, rowHeight, svgContainerHeight, svgContainerWidth]);
  return React.createElement("div", {
    ref: tooltipRef,
    className: relatedX ? styles$2.tooltipDetailsContainer : styles$2.tooltipDetailsContainerHidden,
    style: {
      left: relatedX,
      top: relatedY
    }
  }, React.createElement(TooltipContent, {
    task: task,
    fontSize: fontSize,
    fontFamily: fontFamily
  }));
};
const StandardTooltipContent = ({
  task,
  fontSize,
  fontFamily
}) => {
  const style = {
    fontSize,
    fontFamily
  };
  return React.createElement("div", {
    className: styles$2.tooltipDefaultContainer,
    style: style
  }, React.createElement("b", {
    style: {
      fontSize: fontSize + 6
    }
  }, `${task.name}: ${task.start.getDate()}-${task.start.getMonth() + 1}-${task.start.getFullYear()} - ${task.end.getDate()}-${task.end.getMonth() + 1}-${task.end.getFullYear()}`), task.end.getTime() - task.start.getTime() !== 0 && React.createElement("p", {
    className: styles$2.tooltipDefaultContainerParagraph
  }, `Duration: ${~~((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))} day(s)`), React.createElement("p", {
    className: styles$2.tooltipDefaultContainerParagraph
  }, !!task.progress && `Progress: ${task.progress} %`));
};

var styles$3 = {"scroll":"_vertical-scroll-module__scroll__1eT-t"};

const VerticalScroll = ({
  scroll,
  ganttHeight,
  ganttFullHeight,
  headerHeight,
  rtl,
  onScroll
}) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scroll;
    }
  }, [scroll]);
  return React.createElement("div", {
    style: {
      height: ganttHeight,
      marginTop: headerHeight,
      marginLeft: rtl ? "" : "-17px"
    },
    className: styles$3.scroll,
    onScroll: onScroll,
    ref: scrollRef
  }, React.createElement("div", {
    style: {
      height: ganttFullHeight,
      width: 1
    }
  }));
};

const TaskList = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  scrollY,
  tasks,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  locale,
  ganttHeight,
  taskListRef,
  horizontalContainerClass,
  TaskListHeader,
  TaskListTable
}) => {
  const horizontalContainerRef = useRef(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);
  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth
  };
  const selectedTaskId = selectedTask ? selectedTask.id : "";
  const tableProps = {
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    locale,
    selectedTaskId: selectedTaskId,
    setSelectedTask,
    onExpanderClick
  };
  return React.createElement("div", {
    ref: taskListRef
  }, React.createElement(TaskListHeader, Object.assign({}, headerProps)), React.createElement("div", {
    ref: horizontalContainerRef,
    className: horizontalContainerClass,
    style: ganttHeight ? {
      height: ganttHeight
    } : {}
  }, React.createElement(TaskListTable, Object.assign({}, tableProps))));
};

var styles$4 = {"gridRow":"_grid-module__gridRow__2dZTy","gridRowLine":"_grid-module__gridRowLine__3rUKi","gridTick":"_grid-module__gridTick__RuwuK"};

const GridBody = ({
  tasks,
  dates,
  rowHeight,
  svgWidth,
  columnWidth,
  todayColor,
  rtl
}) => {
  let y = 0;
  const gridRows = [];
  const rowLines = [React.createElement("line", {
    key: "RowLineFirst",
    x: "0",
    y1: 0,
    x2: svgWidth,
    y2: 0,
    className: styles$4.gridRowLine
  })];

  for (const task of tasks) {
    gridRows.push(React.createElement("rect", {
      key: "Row" + task.id,
      x: "0",
      y: y,
      width: svgWidth,
      height: rowHeight,
      className: styles$4.gridRow
    }));
    rowLines.push(React.createElement("line", {
      key: "RowLine" + task.id,
      x: "0",
      y1: y + rowHeight,
      x2: svgWidth,
      y2: y + rowHeight,
      className: styles$4.gridRowLine
    }));
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks = [];
  let today = React.createElement("rect", null);

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(React.createElement("line", {
      key: date.getTime(),
      x1: tickX,
      y1: 0,
      x2: tickX,
      y2: y,
      className: styles$4.gridTick
    }));

    if (i + 1 !== dates.length && date.getTime() < now.getTime() && dates[i + 1].getTime() >= now.getTime() || i !== 0 && i + 1 === dates.length && date.getTime() < now.getTime() && addToDate(date, date.getTime() - dates[i - 1].getTime(), "millisecond").getTime() >= now.getTime()) {
      today = React.createElement("rect", {
        x: tickX,
        y: 0,
        width: columnWidth,
        height: y,
        fill: todayColor
      });
    }

    if (rtl && i + 1 !== dates.length && date.getTime() >= now.getTime() && dates[i + 1].getTime() < now.getTime()) {
      today = React.createElement("rect", {
        x: tickX + columnWidth,
        y: 0,
        width: columnWidth,
        height: y,
        fill: todayColor
      });
    }

    tickX += columnWidth;
  }

  return React.createElement("g", {
    className: "gridBody"
  }, React.createElement("g", {
    className: "rows"
  }, gridRows), React.createElement("g", {
    className: "rowLines"
  }, rowLines), React.createElement("g", {
    className: "ticks"
  }, ticks), React.createElement("g", {
    className: "today"
  }, today));
};

const Grid = props => {
  return React.createElement("g", {
    className: "grid"
  }, React.createElement(GridBody, Object.assign({}, props)));
};

var styles$5 = {"calendarBottomText":"_calendar-module__calendarBottomText__9w8d5","calendarTopTick":"_calendar-module__calendarTopTick__1rLuZ","calendarTopText":"_calendar-module__calendarTopText__2q1Kt","calendarHeader":"_calendar-module__calendarHeader__35nLX"};

const TopPartOfCalendar = ({
  value,
  x1Line,
  y1Line,
  y2Line,
  xText,
  yText
}) => {
  return React.createElement("g", {
    className: "calendarTop"
  }, React.createElement("line", {
    x1: x1Line,
    y1: y1Line,
    x2: x1Line,
    y2: y2Line,
    className: styles$5.calendarTopTick,
    key: value + "line"
  }), React.createElement("text", {
    key: value + "text",
    y: yText,
    x: xText,
    className: styles$5.calendarTopText
  }, value));
};

const Calendar = ({
  dateSetup,
  locale,
  viewMode,
  rtl,
  headerHeight,
  columnWidth,
  fontFamily,
  fontSize
}) => {
  const getCalendarValuesForMonth = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;

    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = getLocaleMonth(date, locale);
      bottomValues.push(React.createElement("text", {
        key: bottomValue + date.getFullYear(),
        y: headerHeight * 0.8,
        x: columnWidth * i + columnWidth * 0.5,
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText;

        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }

        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue,
          value: topValue,
          x1Line: columnWidth * i,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: xText,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForWeek = () => {
    const topValues = [];
    const bottomValues = [];
    let weeksCount = 1;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      let topValue = "";

      if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
        topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`;
      }

      const bottomValue = `W${getWeekNumberISO8601(date)}`;
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * (i + +rtl),
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (topValue) {
        if (i !== dates.length - 1) {
          topValues.push(React.createElement(TopPartOfCalendar, {
            key: topValue,
            value: topValue,
            x1Line: columnWidth * i + weeksCount * columnWidth,
            y1Line: 0,
            y2Line: topDefaultHeight,
            xText: columnWidth * i + columnWidth * weeksCount * 0.5,
            yText: topDefaultHeight * 0.9
          }));
        }

        weeksCount = 0;
      }

      weeksCount++;
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForDay = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = `${getLocalDayOfWeek(date, locale, "short")}, ${date.getDate().toString()}`;
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * i + columnWidth * 0.5,
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (i + 1 !== dates.length && date.getMonth() !== dates[i + 1].getMonth()) {
        const topValue = getLocaleMonth(date, locale);
        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue + date.getFullYear(),
          value: topValue,
          x1Line: columnWidth * (i + 1),
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: columnWidth * (i + 1) - getDaysInMonth(date.getMonth(), date.getFullYear()) * columnWidth * 0.5,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForPartOfDay = () => {
    const topValues = [];
    const bottomValues = [];
    const ticks = viewMode === ViewMode.HalfDay ? 2 : 4;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: "numeric"
      }).format(date);
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * (i + +rtl),
        className: styles$5.calendarBottomText,
        fontFamily: fontFamily
      }, bottomValue));

      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${getLocalDayOfWeek(date, locale, "short")}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue + date.getFullYear(),
          value: topValue,
          x1Line: columnWidth * i + ticks * columnWidth,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: columnWidth * i + ticks * columnWidth * 0.5,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForHour = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: "numeric"
      }).format(date);
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * (i + +rtl),
        className: styles$5.calendarBottomText,
        fontFamily: fontFamily
      }, bottomValue));

      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${getLocalDayOfWeek(date, locale, "long")}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
        const topPosition = (date.getHours() - 24) / 2;
        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue + date.getFullYear(),
          value: topValue,
          x1Line: columnWidth * i,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: columnWidth * (i + topPosition),
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  let topValues = [];
  let bottomValues = [];

  switch (dateSetup.viewMode) {
    case ViewMode.Month:
      [topValues, bottomValues] = getCalendarValuesForMonth();
      break;

    case ViewMode.Week:
      [topValues, bottomValues] = getCalendarValuesForWeek();
      break;

    case ViewMode.Day:
      [topValues, bottomValues] = getCalendarValuesForDay();
      break;

    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
      [topValues, bottomValues] = getCalendarValuesForPartOfDay();
      break;

    case ViewMode.Hour:
      [topValues, bottomValues] = getCalendarValuesForHour();
  }

  return React.createElement("g", {
    className: "calendar",
    fontSize: fontSize,
    fontFamily: fontFamily
  }, React.createElement("rect", {
    x: 0,
    y: 0,
    width: columnWidth * dateSetup.dates.length,
    height: headerHeight,
    className: styles$5.calendarHeader
  }), bottomValues, " ", topValues);
};

const Arrow = ({
  taskFrom,
  taskTo,
  rowHeight,
  taskHeight,
  arrowIndent,
  rtl
}) => {
  let path;
  let trianglePoints;

  if (rtl) {
    [path, trianglePoints] = drownPathAndTriangleRTL(taskFrom, taskTo, rowHeight, taskHeight, arrowIndent);
  } else {
    [path, trianglePoints] = drownPathAndTriangle(taskFrom, taskTo, rowHeight, taskHeight, arrowIndent);
  }

  return React.createElement("g", {
    className: "arrow"
  }, React.createElement("path", {
    strokeWidth: "1.5",
    d: path,
    fill: "none"
  }), React.createElement("polygon", {
    points: trianglePoints
  }));
};

const drownPathAndTriangle = (taskFrom, taskTo, rowHeight, taskHeight, arrowIndent) => {
  const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
  const taskToEndPosition = taskTo.y + taskHeight / 2;
  const taskFromEndPosition = taskFrom.x2 + arrowIndent * 2;
  const taskFromHorizontalOffsetValue = taskFromEndPosition < taskTo.x1 ? "" : `H ${taskTo.x1 - arrowIndent}`;
  const taskToHorizontalOffsetValue = taskFromEndPosition > taskTo.x1 ? arrowIndent : taskTo.x1 - taskFrom.x2 - arrowIndent;
  const path = `M ${taskFrom.x2} ${taskFrom.y + taskHeight / 2} 
  h ${arrowIndent} 
  v ${indexCompare * rowHeight / 2} 
  ${taskFromHorizontalOffsetValue}
  V ${taskToEndPosition} 
  h ${taskToHorizontalOffsetValue}`;
  const trianglePoints = `${taskTo.x1},${taskToEndPosition} 
  ${taskTo.x1 - 5},${taskToEndPosition - 5} 
  ${taskTo.x1 - 5},${taskToEndPosition + 5}`;
  return [path, trianglePoints];
};

const drownPathAndTriangleRTL = (taskFrom, taskTo, rowHeight, taskHeight, arrowIndent) => {
  const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
  const taskToEndPosition = taskTo.y + taskHeight / 2;
  const taskFromEndPosition = taskFrom.x1 - arrowIndent * 2;
  const taskFromHorizontalOffsetValue = taskFromEndPosition > taskTo.x2 ? "" : `H ${taskTo.x2 + arrowIndent}`;
  const taskToHorizontalOffsetValue = taskFromEndPosition < taskTo.x2 ? -arrowIndent : taskTo.x2 - taskFrom.x1 + arrowIndent;
  const path = `M ${taskFrom.x1} ${taskFrom.y + taskHeight / 2} 
  h ${-arrowIndent} 
  v ${indexCompare * rowHeight / 2} 
  ${taskFromHorizontalOffsetValue}
  V ${taskToEndPosition} 
  h ${taskToHorizontalOffsetValue}`;
  const trianglePoints = `${taskTo.x2},${taskToEndPosition} 
  ${taskTo.x2 + 5},${taskToEndPosition + 5} 
  ${taskTo.x2 + 5},${taskToEndPosition - 5}`;
  return [path, trianglePoints];
};

const convertToBarTasks = (tasks, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor) => {
  const dateDelta = dates[1].getTime() - dates[0].getTime() - dates[1].getTimezoneOffset() * 60 * 1000 + dates[0].getTimezoneOffset() * 60 * 1000;
  let barTasks = tasks.map((t, i) => {
    return convertToBarTask(t, i, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor);
  });
  barTasks = barTasks.map(task => {
    const dependencies = task.dependencies || [];

    for (let j = 0; j < dependencies.length; j++) {
      const dependence = barTasks.findIndex(value => value.id === dependencies[j]);
      if (dependence !== -1) barTasks[dependence].barChildren.push(task);
    }

    return task;
  });
  return barTasks;
};

const convertToBarTask = (task, index, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor) => {
  let barTask;

  switch (task.type) {
    case "milestone":
      barTask = convertToMilestone(task, index, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, milestoneBackgroundColor, milestoneBackgroundSelectedColor);
      break;

    case "project":
      barTask = convertToBar(task, index, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor);
      break;

    default:
      barTask = convertToBar(task, index, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor);
      break;
  }

  return barTask;
};

const convertToBar = (task, index, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor) => {
  let x1;
  let x2;

  if (rtl) {
    x2 = taskXCoordinateRTL(task.start, dates, dateDelta, columnWidth);
    x1 = taskXCoordinateRTL(task.end, dates, dateDelta, columnWidth);
  } else {
    x1 = taskXCoordinate(task.start, dates, dateDelta, columnWidth);
    x2 = taskXCoordinate(task.end, dates, dateDelta, columnWidth);
  }

  let typeInternal = task.type;

  if (typeInternal === "task" && x2 - x1 < handleWidth * 2) {
    typeInternal = "smalltask";
    x2 = x1 + handleWidth * 2;
  }

  const [progressWidth, progressX] = progressWithByParams(x1, x2, task.progress, rtl);
  const y = taskYCoordinate(index, rowHeight, taskHeight);
  const hideChildren = task.type === "project" ? task.hideChildren : undefined;
  const styles = {
    backgroundColor: barBackgroundColor,
    backgroundSelectedColor: barBackgroundSelectedColor,
    progressColor: barProgressColor,
    progressSelectedColor: barProgressSelectedColor,
    ...task.styles
  };
  return { ...task,
    typeInternal,
    x1,
    x2,
    y,
    index,
    progressX,
    progressWidth,
    barCornerRadius,
    handleWidth,
    hideChildren,
    height: taskHeight,
    barChildren: [],
    styles
  };
};

const convertToMilestone = (task, index, dates, dateDelta, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, milestoneBackgroundColor, milestoneBackgroundSelectedColor) => {
  const x = taskXCoordinate(task.start, dates, dateDelta, columnWidth);
  const y = taskYCoordinate(index, rowHeight, taskHeight);
  const x1 = x - taskHeight * 0.5;
  const x2 = x + taskHeight * 0.5;
  const rotatedHeight = taskHeight / 1.414;
  const styles = {
    backgroundColor: milestoneBackgroundColor,
    backgroundSelectedColor: milestoneBackgroundSelectedColor,
    progressColor: "",
    progressSelectedColor: "",
    ...task.styles
  };
  return { ...task,
    end: task.start,
    x1,
    x2,
    y,
    index,
    progressX: 0,
    progressWidth: 0,
    barCornerRadius,
    handleWidth,
    typeInternal: task.type,
    progress: 0,
    height: rotatedHeight,
    hideChildren: undefined,
    barChildren: [],
    styles
  };
};

const taskXCoordinate = (xDate, dates, dateDelta, columnWidth) => {
  const index = ~~((xDate.getTime() - dates[0].getTime() + xDate.getTimezoneOffset() - dates[0].getTimezoneOffset()) / dateDelta);
  const x = Math.round((index + (xDate.getTime() - dates[index].getTime() - xDate.getTimezoneOffset() * 60 * 1000 + dates[index].getTimezoneOffset() * 60 * 1000) / dateDelta) * columnWidth);
  return x;
};

const taskXCoordinateRTL = (xDate, dates, dateDelta, columnWidth) => {
  let x = taskXCoordinate(xDate, dates, dateDelta, columnWidth);
  x += columnWidth;
  return x;
};

const taskYCoordinate = (index, rowHeight, taskHeight) => {
  const y = index * rowHeight + (rowHeight - taskHeight) / 2;
  return y;
};

const progressWithByParams = (taskX1, taskX2, progress, rtl) => {
  const progressWidth = (taskX2 - taskX1) * progress * 0.01;
  let progressX;

  if (rtl) {
    progressX = taskX2 - progressWidth;
  } else {
    progressX = taskX1;
  }

  return [progressWidth, progressX];
};

const progressByX = (x, task) => {
  if (x >= task.x2) return 100;else if (x <= task.x1) return 0;else {
    const barWidth = task.x2 - task.x1;
    const progressPercent = Math.round((x - task.x1) * 100 / barWidth);
    return progressPercent;
  }
};

const progressByXRTL = (x, task) => {
  if (x >= task.x2) return 0;else if (x <= task.x1) return 100;else {
    const barWidth = task.x2 - task.x1;
    const progressPercent = Math.round((task.x2 - x) * 100 / barWidth);
    return progressPercent;
  }
};

const getProgressPoint = (progressX, taskY, taskHeight) => {
  const point = [progressX - 5, taskY + taskHeight, progressX + 5, taskY + taskHeight, progressX, taskY + taskHeight - 8.66];
  return point.join(",");
};

const startByX = (x, xStep, task) => {
  if (x >= task.x2 - task.handleWidth * 2) {
    x = task.x2 - task.handleWidth * 2;
  }

  const steps = Math.round((x - task.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX = task.x1 + additionalXValue;
  return newX;
};

const endByX = (x, xStep, task) => {
  if (x <= task.x1 + task.handleWidth * 2) {
    x = task.x1 + task.handleWidth * 2;
  }

  const steps = Math.round((x - task.x2) / xStep);
  const additionalXValue = steps * xStep;
  const newX = task.x2 + additionalXValue;
  return newX;
};

const moveByX = (x, xStep, task) => {
  const steps = Math.round((x - task.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX1 = task.x1 + additionalXValue;
  const newX2 = newX1 + task.x2 - task.x1;
  return [newX1, newX2];
};

const dateByX = (x, taskX, taskDate, xStep, timeStep) => {
  let newDate = new Date((x - taskX) / xStep * timeStep + taskDate.getTime());
  newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset() - taskDate.getTimezoneOffset()) * 60000);
  return newDate;
};

const handleTaskBySVGMouseEvent = (svgX, action, selectedTask, xStep, timeStep, initEventX1Delta, rtl) => {
  let result;

  switch (selectedTask.type) {
    case "milestone":
      result = handleTaskBySVGMouseEventForMilestone(svgX, action, selectedTask, xStep, timeStep, initEventX1Delta);
      break;

    default:
      result = handleTaskBySVGMouseEventForBar(svgX, action, selectedTask, xStep, timeStep, initEventX1Delta, rtl);
      break;
  }

  return result;
};

const handleTaskBySVGMouseEventForBar = (svgX, action, selectedTask, xStep, timeStep, initEventX1Delta, rtl) => {
  const changedTask = { ...selectedTask
  };
  let isChanged = false;

  switch (action) {
    case "progress":
      if (rtl) {
        changedTask.progress = progressByXRTL(svgX, selectedTask);
      } else {
        changedTask.progress = progressByX(svgX, selectedTask);
      }

      isChanged = changedTask.progress !== selectedTask.progress;

      if (isChanged) {
        const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
        changedTask.progressWidth = progressWidth;
        changedTask.progressX = progressX;
      }

      break;

    case "start":
      {
        const newX1 = startByX(svgX, xStep, selectedTask);
        changedTask.x1 = newX1;
        isChanged = changedTask.x1 !== selectedTask.x1;

        if (isChanged) {
          if (rtl) {
            changedTask.end = dateByX(newX1, selectedTask.x1, selectedTask.end, xStep, timeStep);
          } else {
            changedTask.start = dateByX(newX1, selectedTask.x1, selectedTask.start, xStep, timeStep);
          }

          const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
          changedTask.progressWidth = progressWidth;
          changedTask.progressX = progressX;
        }

        break;
      }

    case "end":
      {
        const newX2 = endByX(svgX, xStep, selectedTask);
        changedTask.x2 = newX2;
        isChanged = changedTask.x2 !== selectedTask.x2;

        if (isChanged) {
          if (rtl) {
            changedTask.start = dateByX(newX2, selectedTask.x2, selectedTask.start, xStep, timeStep);
          } else {
            changedTask.end = dateByX(newX2, selectedTask.x2, selectedTask.end, xStep, timeStep);
          }

          const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
          changedTask.progressWidth = progressWidth;
          changedTask.progressX = progressX;
        }

        break;
      }

    case "move":
      {
        const [newMoveX1, newMoveX2] = moveByX(svgX - initEventX1Delta, xStep, selectedTask);
        isChanged = newMoveX1 !== selectedTask.x1;

        if (isChanged) {
          changedTask.start = dateByX(newMoveX1, selectedTask.x1, selectedTask.start, xStep, timeStep);
          changedTask.end = dateByX(newMoveX2, selectedTask.x2, selectedTask.end, xStep, timeStep);
          changedTask.x1 = newMoveX1;
          changedTask.x2 = newMoveX2;
          const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
          changedTask.progressWidth = progressWidth;
          changedTask.progressX = progressX;
        }

        break;
      }
  }

  return {
    isChanged,
    changedTask
  };
};

const handleTaskBySVGMouseEventForMilestone = (svgX, action, selectedTask, xStep, timeStep, initEventX1Delta) => {
  const changedTask = { ...selectedTask
  };
  let isChanged = false;

  switch (action) {
    case "move":
      {
        const [newMoveX1, newMoveX2] = moveByX(svgX - initEventX1Delta, xStep, selectedTask);
        isChanged = newMoveX1 !== selectedTask.x1;

        if (isChanged) {
          changedTask.start = dateByX(newMoveX1, selectedTask.x1, selectedTask.start, xStep, timeStep);
          changedTask.end = changedTask.start;
          changedTask.x1 = newMoveX1;
          changedTask.x2 = newMoveX2;
        }

        break;
      }
  }

  return {
    isChanged,
    changedTask
  };
};

function isKeyboardEvent(event) {
  return event.key !== undefined;
}
function removeHiddenTasks(tasks) {
  const groupedTasks = tasks.filter(t => t.hideChildren && t.type === "project");

  if (groupedTasks.length > 0) {
    for (let i = 0; groupedTasks.length > i; i++) {
      const groupedTask = groupedTasks[i];
      const children = getChildren(tasks, groupedTask);
      tasks = tasks.filter(t => children.indexOf(t) === -1);
    }
  }

  return tasks;
}

function getChildren(taskList, task) {
  let tasks = [];

  if (task.type !== "project") {
    tasks = taskList.filter(t => t.dependencies && t.dependencies.indexOf(task.id) !== -1);
  } else {
    tasks = taskList.filter(t => t.project && t.project === task.id);
  }

  const taskChildren = tasks.reduce((children, t) => children.concat(children, getChildren(taskList, t)), []);
  tasks = tasks.concat(tasks, taskChildren);
  return tasks;
}

const sortTasks = (taskA, taskB) => {
  const orderA = taskA.displayOrder || Number.MAX_VALUE;
  const orderB = taskB.displayOrder || Number.MAX_VALUE;

  if (orderA > orderB) {
    return 1;
  } else if (orderA < orderB) {
    return -1;
  } else {
    return 0;
  }
};

var styles$6 = {"barWrapper":"_bar-module__barWrapper__KxSXS","barHandle":"_bar-module__barHandle__3w_5u","barBackground":"_bar-module__barBackground__31ERP"};

const BarDisplay = ({
  x,
  y,
  width,
  height,
  isSelected,
  progressX,
  progressWidth,
  barCornerRadius,
  styles,
  onMouseDown
}) => {
  const getProcessColor = () => {
    return isSelected ? styles.progressSelectedColor : styles.progressColor;
  };

  const getBarColor = () => {
    return isSelected ? styles.backgroundSelectedColor : styles.backgroundColor;
  };

  return React.createElement("g", {
    onMouseDown: onMouseDown
  }, React.createElement("rect", {
    x: x,
    width: width,
    y: y,
    height: height,
    ry: barCornerRadius,
    rx: barCornerRadius,
    fill: getBarColor(),
    className: styles$6.barBackground
  }), React.createElement("rect", {
    x: progressX,
    width: progressWidth,
    y: y,
    height: height,
    ry: barCornerRadius,
    rx: barCornerRadius,
    fill: getProcessColor()
  }));
};

const BarDateHandle = ({
  x,
  y,
  width,
  height,
  barCornerRadius,
  onMouseDown
}) => {
  return React.createElement("rect", {
    x: x,
    y: y,
    width: width,
    height: height,
    className: styles$6.barHandle,
    ry: barCornerRadius,
    rx: barCornerRadius,
    onMouseDown: onMouseDown
  });
};

const BarProgressHandle = ({
  progressPoint,
  onMouseDown
}) => {
  return React.createElement("polygon", {
    className: styles$6.barHandle,
    points: progressPoint,
    onMouseDown: onMouseDown
  });
};

const Bar = ({
  task,
  isProgressChangeable,
  isDateChangeable,
  rtl,
  onEventStart,
  isSelected
}) => {
  const progressPoint = getProgressPoint(+!rtl * task.progressWidth + task.progressX, task.y, task.height);
  const handleHeight = task.height - 2;
  return React.createElement("g", {
    className: styles$6.barWrapper,
    tabIndex: 0
  }, React.createElement(BarDisplay, {
    x: task.x1,
    y: task.y,
    width: task.x2 - task.x1,
    height: task.height,
    progressX: task.progressX,
    progressWidth: task.progressWidth,
    barCornerRadius: task.barCornerRadius,
    styles: task.styles,
    isSelected: isSelected,
    onMouseDown: e => {
      isDateChangeable && onEventStart("move", task, e);
    }
  }), React.createElement("g", {
    className: "handleGroup"
  }, isDateChangeable && React.createElement("g", null, React.createElement(BarDateHandle, {
    x: task.x1 + 1,
    y: task.y + 1,
    width: task.handleWidth,
    height: handleHeight,
    barCornerRadius: task.barCornerRadius,
    onMouseDown: e => {
      onEventStart("start", task, e);
    }
  }), React.createElement(BarDateHandle, {
    x: task.x2 - task.handleWidth - 1,
    y: task.y + 1,
    width: task.handleWidth,
    height: handleHeight,
    barCornerRadius: task.barCornerRadius,
    onMouseDown: e => {
      onEventStart("end", task, e);
    }
  })), isProgressChangeable && React.createElement(BarProgressHandle, {
    progressPoint: progressPoint,
    onMouseDown: e => {
      onEventStart("progress", task, e);
    }
  })));
};

const BarSmall = ({
  task,
  isProgressChangeable,
  isDateChangeable,
  onEventStart,
  isSelected
}) => {
  const progressPoint = getProgressPoint(task.progressWidth + task.x1, task.y, task.height);
  return React.createElement("g", {
    className: styles$6.barWrapper,
    tabIndex: 0
  }, React.createElement(BarDisplay, {
    x: task.x1,
    y: task.y,
    width: task.x2 - task.x1,
    height: task.height,
    progressX: task.progressX,
    progressWidth: task.progressWidth,
    barCornerRadius: task.barCornerRadius,
    styles: task.styles,
    isSelected: isSelected,
    onMouseDown: e => {
      isDateChangeable && onEventStart("move", task, e);
    }
  }), React.createElement("g", {
    className: "handleGroup"
  }, isProgressChangeable && React.createElement(BarProgressHandle, {
    progressPoint: progressPoint,
    onMouseDown: e => {
      onEventStart("progress", task, e);
    }
  })));
};

var styles$7 = {"milestoneWrapper":"_milestone-module__milestoneWrapper__RRr13","milestoneBackground":"_milestone-module__milestoneBackground__2P2B1"};

const Milestone = ({
  task,
  isDateChangeable,
  onEventStart,
  isSelected
}) => {
  const transform = `rotate(45 ${task.x1 + task.height * 0.356} 
    ${task.y + task.height * 0.85})`;

  const getBarColor = () => {
    return isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  };

  return React.createElement("g", {
    tabIndex: 0,
    className: styles$7.milestoneWrapper
  }, React.createElement("rect", {
    fill: getBarColor(),
    x: task.x1,
    width: task.height,
    y: task.y,
    height: task.height,
    rx: task.barCornerRadius,
    ry: task.barCornerRadius,
    transform: transform,
    className: styles$7.milestoneBackground,
    onMouseDown: e => {
      isDateChangeable && onEventStart("move", task, e);
    }
  }));
};

var styles$8 = {"projectWrapper":"_project-module__projectWrapper__1KJ6x","projectBackground":"_project-module__projectBackground__2RbVy","projectTop":"_project-module__projectTop__2pZMF"};

const Project = ({
  task,
  isSelected
}) => {
  const barColor = isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  const processColor = isSelected ? task.styles.progressSelectedColor : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;
  const projectLeftTriangle = [task.x1, task.y + task.height / 2 - 1, task.x1, task.y + task.height, task.x1 + 15, task.y + task.height / 2 - 1].join(",");
  const projectRightTriangle = [task.x2, task.y + task.height / 2 - 1, task.x2, task.y + task.height, task.x2 - 15, task.y + task.height / 2 - 1].join(",");
  return React.createElement("g", {
    tabIndex: 0,
    className: styles$8.projectWrapper
  }, React.createElement("rect", {
    fill: barColor,
    x: task.x1,
    width: projectWith,
    y: task.y,
    height: task.height,
    rx: task.barCornerRadius,
    ry: task.barCornerRadius,
    className: styles$8.projectBackground
  }), React.createElement("rect", {
    x: task.progressX,
    width: task.progressWidth,
    y: task.y,
    height: task.height,
    ry: task.barCornerRadius,
    rx: task.barCornerRadius,
    fill: processColor
  }), React.createElement("rect", {
    fill: barColor,
    x: task.x1,
    width: projectWith,
    y: task.y,
    height: task.height / 2,
    rx: task.barCornerRadius,
    ry: task.barCornerRadius,
    className: styles$8.projectTop
  }), React.createElement("polygon", {
    className: styles$8.projectTop,
    points: projectLeftTriangle,
    fill: barColor
  }), React.createElement("polygon", {
    className: styles$8.projectTop,
    points: projectRightTriangle,
    fill: barColor
  }));
};

var style = {"barLabel":"_task-list-module__barLabel__3zRJQ","barLabelOutside":"_task-list-module__barLabelOutside__3KcaM"};

const TaskItem = props => {
  const {
    task,
    arrowIndent,
    isDelete,
    taskHeight,
    isSelected,
    rtl,
    onEventStart
  } = { ...props
  };
  const textRef = useRef(null);
  const [taskItem, setTaskItem] = useState(React.createElement("div", null));
  const [isTextInside, setIsTextInside] = useState(true);
  useEffect(() => {
    switch (task.typeInternal) {
      case "milestone":
        setTaskItem(React.createElement(Milestone, Object.assign({}, props)));
        break;

      case "project":
        setTaskItem(React.createElement(Project, Object.assign({}, props)));
        break;

      case "smalltask":
        setTaskItem(React.createElement(BarSmall, Object.assign({}, props)));
        break;

      default:
        setTaskItem(React.createElement(Bar, Object.assign({}, props)));
        break;
    }
  }, [task, isSelected]);
  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;

    if (isTextInside) {
      return task.x1 + width * 0.5;
    }

    if (rtl && textRef.current) {
      return task.x1 - textRef.current.getBBox().width - arrowIndent * +hasChild - arrowIndent * 0.2;
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };

  return React.createElement("g", {
    onKeyDown: e => {
      switch (e.key) {
        case "Delete":
          {
            if (isDelete) onEventStart("delete", task, e);
            break;
          }
      }

      e.stopPropagation();
    },
    onMouseEnter: e => {
      onEventStart("mouseenter", task, e);
    },
    onMouseLeave: e => {
      onEventStart("mouseleave", task, e);
    },
    onDoubleClick: e => {
      onEventStart("dblclick", task, e);
    },
    onFocus: () => {
      onEventStart("select", task);
    }
  }, taskItem, React.createElement("text", {
    x: getX(),
    y: task.y + taskHeight * 0.5,
    className: isTextInside ? style.barLabel :  style.barLabelOutside,
    ref: textRef
  }, task.name));
};

const TaskGanttContent = ({
  tasks,
  dates,
  ganttEvent,
  selectedTask,
  rowHeight,
  columnWidth,
  timeStep,
  svg,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setFailedTask,
  setSelectedTask,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onDelete
}) => {
  var _svg$current;

  const point = svg === null || svg === void 0 ? void 0 : (_svg$current = svg.current) === null || _svg$current === void 0 ? void 0 : _svg$current.createSVGPoint();
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    const dateDelta = dates[1].getTime() - dates[0].getTime() - dates[1].getTimezoneOffset() * 60 * 1000 + dates[0].getTimezoneOffset() * 60 * 1000;
    const newXStep = timeStep * columnWidth / dateDelta;
    setXStep(newXStep);
  }, [columnWidth, dates, timeStep]);
  useEffect(() => {
    const handleMouseMove = async event => {
      var _svg$current$getScree;

      if (!ganttEvent.changedTask || !point || !(svg !== null && svg !== void 0 && svg.current)) return;
      event.preventDefault();
      point.x = event.clientX;
      const cursor = point.matrixTransform(svg === null || svg === void 0 ? void 0 : (_svg$current$getScree = svg.current.getScreenCTM()) === null || _svg$current$getScree === void 0 ? void 0 : _svg$current$getScree.inverse());
      const {
        isChanged,
        changedTask
      } = handleTaskBySVGMouseEvent(cursor.x, ganttEvent.action, ganttEvent.changedTask, xStep, timeStep, initEventX1Delta, rtl);

      if (isChanged) {
        setGanttEvent({
          action: ganttEvent.action,
          changedTask
        });
      }
    };

    const handleMouseUp = async event => {
      var _svg$current$getScree2;

      const {
        action,
        originalSelectedTask,
        changedTask
      } = ganttEvent;
      if (!changedTask || !point || !(svg !== null && svg !== void 0 && svg.current) || !originalSelectedTask) return;
      event.preventDefault();
      point.x = event.clientX;
      const cursor = point.matrixTransform(svg === null || svg === void 0 ? void 0 : (_svg$current$getScree2 = svg.current.getScreenCTM()) === null || _svg$current$getScree2 === void 0 ? void 0 : _svg$current$getScree2.inverse());
      const {
        changedTask: newChangedTask
      } = handleTaskBySVGMouseEvent(cursor.x, action, changedTask, xStep, timeStep, initEventX1Delta, rtl);
      const isNotLikeOriginal = originalSelectedTask.start !== newChangedTask.start || originalSelectedTask.end !== newChangedTask.end || originalSelectedTask.progress !== newChangedTask.progress;
      svg.current.removeEventListener("mousemove", handleMouseMove);
      svg.current.removeEventListener("mouseup", handleMouseUp);
      setGanttEvent({
        action: ""
      });
      setIsMoving(false);
      let operationSuccess = true;

      if ((action === "move" || action === "end" || action === "start") && onDateChange && isNotLikeOriginal) {
        try {
          const result = await onDateChange(newChangedTask, newChangedTask.barChildren);

          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      } else if (onProgressChange && isNotLikeOriginal) {
        try {
          const result = await onProgressChange(newChangedTask, newChangedTask.barChildren);

          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      }

      if (!operationSuccess) {
        setFailedTask(originalSelectedTask);
      }
    };

    if (!isMoving && (ganttEvent.action === "move" || ganttEvent.action === "end" || ganttEvent.action === "start" || ganttEvent.action === "progress") && svg !== null && svg !== void 0 && svg.current) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
      setIsMoving(true);
    }
  }, [ganttEvent, xStep, initEventX1Delta, onProgressChange, timeStep, onDateChange, svg, isMoving]);

  const handleBarEventStart = async (action, task, event) => {
    if (!event) {
      if (action === "select") {
        setSelectedTask(task.id);
      }
    } else if (isKeyboardEvent(event)) {
      if (action === "delete") {
        if (onDelete) {
          try {
            const result = await onDelete(task);

            if (result !== undefined && result) {
              setGanttEvent({
                action,
                changedTask: task
              });
            }
          } catch (error) {
            console.error("Error on Delete. " + error);
          }
        }
      }
    } else if (action === "mouseenter") {
      if (!ganttEvent.action) {
        setGanttEvent({
          action,
          changedTask: task,
          originalSelectedTask: task
        });
      }
    } else if (action === "mouseleave") {
      if (ganttEvent.action === "mouseenter") {
        setGanttEvent({
          action: ""
        });
      }
    } else if (action === "dblclick") {
      !!onDoubleClick && onDoubleClick(task);
    } else if (action === "move") {
      var _svg$current$getScree3;

      if (!(svg !== null && svg !== void 0 && svg.current) || !point) return;
      point.x = event.clientX;
      const cursor = point.matrixTransform((_svg$current$getScree3 = svg.current.getScreenCTM()) === null || _svg$current$getScree3 === void 0 ? void 0 : _svg$current$getScree3.inverse());
      setInitEventX1Delta(cursor.x - task.x1);
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task
      });
    } else {
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task
      });
    }
  };

  return React.createElement("g", {
    className: "content"
  }, React.createElement("g", {
    className: "arrows",
    fill: arrowColor,
    stroke: arrowColor
  }, tasks.map(task => {
    return task.barChildren.map(child => {
      return React.createElement(Arrow, {
        key: `Arrow from ${task.id} to ${tasks[child.index].id}`,
        taskFrom: task,
        taskTo: tasks[child.index],
        rowHeight: rowHeight,
        taskHeight: taskHeight,
        arrowIndent: arrowIndent,
        rtl: rtl
      });
    });
  })), React.createElement("g", {
    className: "bar",
    fontFamily: fontFamily,
    fontSize: fontSize
  }, tasks.map(task => {
    return React.createElement(TaskItem, {
      task: task,
      arrowIndent: arrowIndent,
      taskHeight: taskHeight,
      isProgressChangeable: !!onProgressChange && !task.isDisabled,
      isDateChangeable: !!onDateChange && !task.isDisabled,
      isDelete: !task.isDisabled,
      onEventStart: handleBarEventStart,
      key: task.id,
      isSelected: !!selectedTask && task.id === selectedTask.id,
      rtl: rtl
    });
  })));
};

var styles$9 = {"ganttVerticalContainer":"_gantt-module__ganttVerticalContainer__CZjuD","horizontalContainer":"_gantt-module__horizontalContainer__2B2zv","wrapper":"_gantt-module__wrapper__3eULf"};

const TaskGantt = ({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  scrollY,
  scrollX
}) => {
  const ganttSVGRef = useRef(null);
  const horizontalContainerRef = useRef(null);
  const verticalGanttContainerRef = useRef(null);
  const newBarProps = { ...barProps,
    svg: ganttSVGRef
  };
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);
  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);
  return React.createElement("div", {
    className: styles$9.ganttVerticalContainer,
    ref: verticalGanttContainerRef,
    dir: "ltr"
  }, React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: gridProps.svgWidth,
    height: calendarProps.headerHeight,
    fontFamily: barProps.fontFamily
  }, React.createElement(Calendar, Object.assign({}, calendarProps))), React.createElement("div", {
    ref: horizontalContainerRef,
    className: styles$9.horizontalContainer,
    style: ganttHeight ? {
      height: ganttHeight,
      width: gridProps.svgWidth
    } : {
      width: gridProps.svgWidth
    }
  }, React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: gridProps.svgWidth,
    height: barProps.rowHeight * barProps.tasks.length,
    fontFamily: barProps.fontFamily,
    ref: ganttSVGRef
  }, React.createElement(Grid, Object.assign({}, gridProps)), React.createElement(TaskGanttContent, Object.assign({}, newBarProps)))));
};

var styles$a = {"scroll":"_horizontal-scroll-module__scroll__19jgW"};

const HorizontalScroll = ({
  scroll,
  svgWidth,
  taskListWidth,
  rtl,
  onScroll
}) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scroll;
    }
  }, [scroll]);
  return React.createElement("div", {
    dir: "ltr",
    style: {
      margin: rtl ? `0px ${taskListWidth}px 0px 0px` : `0px 0px 0px ${taskListWidth}px`
    },
    className: styles$a.scroll,
    onScroll: onScroll,
    ref: scrollRef
  }, React.createElement("div", {
    style: {
      width: svgWidth,
      height: 1
    }
  }));
};

const Gantt = ({
  tasks,
  headerHeight: _headerHeight = 50,
  columnWidth: _columnWidth = 60,
  listCellWidth: _listCellWidth = "155px",
  rowHeight: _rowHeight = 50,
  ganttHeight: _ganttHeight = 0,
  viewMode: _viewMode = ViewMode.Day,
  locale: _locale = "en-GB",
  barFill: _barFill = 60,
  barCornerRadius: _barCornerRadius = 3,
  barProgressColor: _barProgressColor = "#a3a3ff",
  barProgressSelectedColor: _barProgressSelectedColor = "#8282f5",
  barBackgroundColor: _barBackgroundColor = "#b8c2cc",
  barBackgroundSelectedColor: _barBackgroundSelectedColor = "#aeb8c2",
  projectProgressColor: _projectProgressColor = "#7db59a",
  projectProgressSelectedColor: _projectProgressSelectedColor = "#59a985",
  projectBackgroundColor: _projectBackgroundColor = "#fac465",
  projectBackgroundSelectedColor: _projectBackgroundSelectedColor = "#f7bb53",
  milestoneBackgroundColor: _milestoneBackgroundColor = "#f1c453",
  milestoneBackgroundSelectedColor: _milestoneBackgroundSelectedColor = "#f29e4c",
  rtl: _rtl = false,
  handleWidth: _handleWidth = 8,
  timeStep: _timeStep = 300000,
  arrowColor: _arrowColor = "grey",
  fontFamily: _fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize: _fontSize = "14px",
  arrowIndent: _arrowIndent = 20,
  todayColor: _todayColor = "rgba(252, 248, 227, 0.5)",
  viewDate,
  TooltipContent: _TooltipContent = StandardTooltipContent,
  TaskListHeader: _TaskListHeader = TaskListHeaderDefault,
  TaskListTable: _TaskListTable = TaskListTableDefault,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onDelete,
  onSelect,
  onExpanderClick
}) => {
  const wrapperRef = useRef(null);
  const taskListRef = useRef(null);
  const [dateSetup, setDateSetup] = useState(() => {
    const [startDate, endDate] = ganttDateRange(tasks, _viewMode);
    return {
      viewMode: _viewMode,
      dates: seedDates(startDate, endDate, _viewMode)
    };
  });
  const [currentViewDate, setCurrentViewDate] = useState(undefined);
  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(_ganttHeight);
  const [barTasks, setBarTasks] = useState([]);
  const [ganttEvent, setGanttEvent] = useState({
    action: ""
  });
  const taskHeight = useMemo(() => _rowHeight * _barFill / 100, [_rowHeight, _barFill]);
  const [selectedTask, setSelectedTask] = useState();
  const [failedTask, setFailedTask] = useState(null);
  const svgWidth = dateSetup.dates.length * _columnWidth;
  const ganttFullHeight = barTasks.length * _rowHeight;
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);
  useEffect(() => {
    let filteredTasks;

    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(tasks);
    } else {
      filteredTasks = tasks;
    }

    filteredTasks = filteredTasks.sort(sortTasks);
    const [startDate, endDate] = ganttDateRange(filteredTasks, _viewMode);
    let newDates = seedDates(startDate, endDate, _viewMode);

    if (_rtl) {
      newDates = newDates.reverse();

      if (scrollX === -1) {
        setScrollX(newDates.length * _columnWidth);
      }
    }

    setDateSetup({
      dates: newDates,
      viewMode: _viewMode
    });
    setBarTasks(convertToBarTasks(filteredTasks, newDates, _columnWidth, _rowHeight, taskHeight, _barCornerRadius, _handleWidth, _rtl, _barProgressColor, _barProgressSelectedColor, _barBackgroundColor, _barBackgroundSelectedColor, _projectProgressColor, _projectProgressSelectedColor, _projectBackgroundColor, _projectBackgroundSelectedColor, _milestoneBackgroundColor, _milestoneBackgroundSelectedColor));
  }, [tasks, _viewMode, _rowHeight, _barCornerRadius, _columnWidth, taskHeight, _handleWidth, _barProgressColor, _barProgressSelectedColor, _barBackgroundColor, _barBackgroundSelectedColor, _projectProgressColor, _projectProgressSelectedColor, _projectBackgroundColor, _projectBackgroundSelectedColor, _milestoneBackgroundColor, _milestoneBackgroundSelectedColor, _rtl, scrollX, onExpanderClick]);
  useEffect(() => {
    if (_viewMode === dateSetup.viewMode && (viewDate && !currentViewDate || viewDate && (currentViewDate === null || currentViewDate === void 0 ? void 0 : currentViewDate.valueOf()) !== viewDate.valueOf())) {
      const dates = dateSetup.dates;
      const index = dates.findIndex((d, i) => viewDate.valueOf() >= d.valueOf() && i + 1 !== dates.length && viewDate.valueOf() < dates[i + 1].valueOf());

      if (index === -1) {
        return;
      }

      setCurrentViewDate(viewDate);
      setScrollX(_columnWidth * index);
    }
  }, [viewDate, _columnWidth, dateSetup.dates, _viewMode, currentViewDate, setCurrentViewDate]);
  useEffect(() => {
    const {
      changedTask,
      action
    } = ganttEvent;

    if (changedTask) {
      if (action === "delete") {
        setGanttEvent({
          action: ""
        });
        setBarTasks(barTasks.filter(t => t.id !== changedTask.id));
      } else if (action === "move" || action === "end" || action === "start" || action === "progress") {
        const prevStateTask = barTasks.find(t => t.id === changedTask.id);

        if (prevStateTask && (prevStateTask.start.getTime() !== changedTask.start.getTime() || prevStateTask.end.getTime() !== changedTask.end.getTime() || prevStateTask.progress !== changedTask.progress)) {
          const newTaskList = barTasks.map(t => t.id === changedTask.id ? changedTask : t);
          setBarTasks(newTaskList);
        }
      }
    }
  }, [ganttEvent, barTasks]);
  useEffect(() => {
    if (failedTask) {
      setBarTasks(barTasks.map(t => t.id !== failedTask.id ? t : failedTask));
      setFailedTask(null);
    }
  }, [failedTask, barTasks]);
  useEffect(() => {
    if (!_listCellWidth) {
      setTaskListWidth(0);
    }

    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, _listCellWidth]);
  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth]);
  useEffect(() => {
    if (_ganttHeight) {
      setSvgContainerHeight(_ganttHeight + _headerHeight);
    } else {
      setSvgContainerHeight(tasks.length * _rowHeight + _headerHeight);
    }
  }, [_ganttHeight, tasks]);
  useEffect(() => {
    const handleWheel = event => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;

        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }

        setScrollX(newScrollX);
        event.preventDefault();
      } else if (_ganttHeight) {
        let newScrollY = scrollY + event.deltaY;

        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - _ganttHeight) {
          newScrollY = ganttFullHeight - _ganttHeight;
        }

        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    if (wrapperRef.current) {
      wrapperRef.current.addEventListener("wheel", handleWheel, {
        passive: false
      });
    }

    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener("wheel", handleWheel);
      }
    };
  }, [wrapperRef.current, scrollY, scrollX, _ganttHeight, svgWidth, _rtl]);

  const handleScrollY = event => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
    }

    setIgnoreScrollEvent(false);
  };

  const handleScrollX = event => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
    }

    setIgnoreScrollEvent(false);
  };

  const handleKeyDown = event => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;

    switch (event.key) {
      case "Down":
      case "ArrowDown":
        newScrollY += _rowHeight;
        isX = false;
        break;

      case "Up":
      case "ArrowUp":
        newScrollY -= _rowHeight;
        isX = false;
        break;

      case "Left":
      case "ArrowLeft":
        newScrollX -= _columnWidth;
        break;

      case "Right":
      case "ArrowRight":
        newScrollX += _columnWidth;
        break;
    }

    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }

      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - _ganttHeight) {
        newScrollY = ganttFullHeight - _ganttHeight;
      }

      setScrollY(newScrollY);
    }

    setIgnoreScrollEvent(true);
  };

  const handleSelectedTask = taskId => {
    const newSelectedTask = barTasks.find(t => t.id === taskId);
    const oldSelectedTask = barTasks.find(t => !!selectedTask && t.id === selectedTask.id);

    if (onSelect) {
      if (oldSelectedTask) {
        onSelect(oldSelectedTask, false);
      }

      if (newSelectedTask) {
        onSelect(newSelectedTask, true);
      }
    }

    setSelectedTask(newSelectedTask);
  };

  const handleExpanderClick = task => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task,
        hideChildren: !task.hideChildren
      });
    }
  };

  const gridProps = {
    columnWidth: _columnWidth,
    svgWidth,
    tasks: tasks,
    rowHeight: _rowHeight,
    dates: dateSetup.dates,
    todayColor: _todayColor,
    rtl: _rtl
  };
  const calendarProps = {
    dateSetup,
    locale: _locale,
    viewMode: _viewMode,
    headerHeight: _headerHeight,
    columnWidth: _columnWidth,
    fontFamily: _fontFamily,
    fontSize: _fontSize,
    rtl: _rtl
  };
  const barProps = {
    tasks: barTasks,
    dates: dateSetup.dates,
    ganttEvent,
    selectedTask,
    rowHeight: _rowHeight,
    taskHeight,
    columnWidth: _columnWidth,
    arrowColor: _arrowColor,
    timeStep: _timeStep,
    fontFamily: _fontFamily,
    fontSize: _fontSize,
    arrowIndent: _arrowIndent,
    svgWidth,
    rtl: _rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedTask: handleSelectedTask,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onDelete
  };
  const tableProps = {
    rowHeight: _rowHeight,
    rowWidth: _listCellWidth,
    fontFamily: _fontFamily,
    fontSize: _fontSize,
    tasks: barTasks,
    locale: _locale,
    headerHeight: _headerHeight,
    scrollY,
    ganttHeight: _ganttHeight,
    horizontalContainerClass: styles$9.horizontalContainer,
    selectedTask,
    taskListRef,
    setSelectedTask: handleSelectedTask,
    onExpanderClick: handleExpanderClick,
    TaskListHeader: _TaskListHeader,
    TaskListTable: _TaskListTable
  };
  return React.createElement("div", null, React.createElement("div", {
    className: styles$9.wrapper,
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    ref: wrapperRef
  }, _listCellWidth && React.createElement(TaskList, Object.assign({}, tableProps)), React.createElement(TaskGantt, {
    gridProps: gridProps,
    calendarProps: calendarProps,
    barProps: barProps,
    ganttHeight: _ganttHeight,
    scrollY: scrollY,
    scrollX: scrollX
  }), ganttEvent.changedTask && React.createElement(Tooltip, {
    arrowIndent: _arrowIndent,
    rowHeight: _rowHeight,
    svgContainerHeight: svgContainerHeight,
    svgContainerWidth: svgContainerWidth,
    fontFamily: _fontFamily,
    fontSize: _fontSize,
    scrollX: scrollX,
    scrollY: scrollY,
    task: ganttEvent.changedTask,
    headerHeight: _headerHeight,
    taskListWidth: taskListWidth,
    TooltipContent: _TooltipContent,
    rtl: _rtl,
    svgWidth: svgWidth
  }), React.createElement(VerticalScroll, {
    ganttFullHeight: ganttFullHeight,
    ganttHeight: _ganttHeight,
    headerHeight: _headerHeight,
    scroll: scrollY,
    onScroll: handleScrollY,
    rtl: _rtl
  })), React.createElement(HorizontalScroll, {
    svgWidth: svgWidth,
    taskListWidth: taskListWidth,
    scroll: scrollX,
    rtl: _rtl,
    onScroll: handleScrollX
  }));
};

export { Gantt, ViewMode };
//# sourceMappingURL=index.modern.js.map
