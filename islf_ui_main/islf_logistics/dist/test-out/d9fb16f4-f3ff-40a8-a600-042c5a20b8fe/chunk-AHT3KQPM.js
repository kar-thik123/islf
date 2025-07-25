import {
  ANIMATION_MODULE_TYPE,
  BehaviorSubject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  CommonModule,
  Compiler,
  Component,
  ConnectableObservable,
  Console,
  ContentChild,
  ContentChildren,
  DOCUMENT,
  DestroyRef,
  Directive,
  EMPTY,
  ElementRef,
  EmptyError,
  EnvironmentInjector,
  EventEmitter,
  FactoryTarget,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  Location,
  NgClass,
  NgForOf,
  NgIf,
  NgModule,
  NgModuleFactory$1,
  NgStyle,
  NgTemplateOutlet,
  NgZone,
  Output,
  PLATFORM_ID,
  PendingTasksInternal,
  Renderer2,
  RendererFactory2,
  RuntimeError,
  Subject,
  Subscription,
  TemplateRef,
  Title,
  Version,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  __esm,
  __spreadProps,
  __spreadValues,
  booleanAttribute,
  catchError,
  combineLatest,
  concat,
  concatMap,
  core_exports,
  createEnvironmentInjector,
  defaultIfEmpty,
  defer,
  effect,
  filter,
  finalize,
  first,
  from,
  init_common,
  init_core,
  init_esm,
  init_operators,
  init_platform_browser,
  inject,
  input,
  isInjectable,
  isNgModule,
  isObservable,
  isPlatformServer,
  isPromise,
  isStandalone,
  last,
  map,
  mergeMap,
  numberAttribute,
  of,
  pipe,
  refCount,
  reflectComponentType,
  runInInjectionContext,
  scan,
  signal,
  startWith,
  switchMap,
  take,
  takeLast,
  takeUntil,
  tap,
  throwError,
  untracked,
  ɵɵngDeclareClassMetadata,
  ɵɵngDeclareComponent,
  ɵɵngDeclareDirective,
  ɵɵngDeclareFactory,
  ɵɵngDeclareInjectable,
  ɵɵngDeclareInjector,
  ɵɵngDeclareNgModule
} from "./chunk-T6AREU7G.js";

// node_modules/@angular/router/fesm2022/router-Dwfin5Au.mjs
function convertToParamMap(params) {
  return new ParamsAsMap(params);
}
function defaultUrlMatcher(segments, segmentGroup, route) {
  const parts = route.path.split("/");
  if (parts.length > segments.length) {
    return null;
  }
  if (route.pathMatch === "full" && (segmentGroup.hasChildren() || parts.length < segments.length)) {
    return null;
  }
  const posParams = {};
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const segment = segments[index];
    const isParameter = part[0] === ":";
    if (isParameter) {
      posParams[part.substring(1)] = segment;
    } else if (part !== segment.path) {
      return null;
    }
  }
  return {
    consumed: segments.slice(0, parts.length),
    posParams
  };
}
function shallowEqualArrays(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (!shallowEqual(a[i], b[i])) return false;
  }
  return true;
}
function shallowEqual(a, b) {
  const k1 = a ? getDataKeys(a) : void 0;
  const k2 = b ? getDataKeys(b) : void 0;
  if (!k1 || !k2 || k1.length != k2.length) {
    return false;
  }
  let key;
  for (let i = 0; i < k1.length; i++) {
    key = k1[i];
    if (!equalArraysOrString(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
function getDataKeys(obj) {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
}
function equalArraysOrString(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const aSorted = [...a].sort();
    const bSorted = [...b].sort();
    return aSorted.every((val, index) => bSorted[index] === val);
  } else {
    return a === b;
  }
}
function last2(a) {
  return a.length > 0 ? a[a.length - 1] : null;
}
function wrapIntoObservable(value) {
  if (isObservable(value)) {
    return value;
  }
  if (isPromise(value)) {
    return from(Promise.resolve(value));
  }
  return of(value);
}
function containsTree(container, containee, options) {
  return pathCompareMap[options.paths](container.root, containee.root, options.matrixParams) && paramCompareMap[options.queryParams](container.queryParams, containee.queryParams) && !(options.fragment === "exact" && container.fragment !== containee.fragment);
}
function equalParams(container, containee) {
  return shallowEqual(container, containee);
}
function equalSegmentGroups(container, containee, matrixParams) {
  if (!equalPath(container.segments, containee.segments)) return false;
  if (!matrixParamsMatch(container.segments, containee.segments, matrixParams)) {
    return false;
  }
  if (container.numberOfChildren !== containee.numberOfChildren) return false;
  for (const c in containee.children) {
    if (!container.children[c]) return false;
    if (!equalSegmentGroups(container.children[c], containee.children[c], matrixParams)) return false;
  }
  return true;
}
function containsParams(container, containee) {
  return Object.keys(containee).length <= Object.keys(container).length && Object.keys(containee).every((key) => equalArraysOrString(container[key], containee[key]));
}
function containsSegmentGroup(container, containee, matrixParams) {
  return containsSegmentGroupHelper(container, containee, containee.segments, matrixParams);
}
function containsSegmentGroupHelper(container, containee, containeePaths, matrixParams) {
  if (container.segments.length > containeePaths.length) {
    const current = container.segments.slice(0, containeePaths.length);
    if (!equalPath(current, containeePaths)) return false;
    if (containee.hasChildren()) return false;
    if (!matrixParamsMatch(current, containeePaths, matrixParams)) return false;
    return true;
  } else if (container.segments.length === containeePaths.length) {
    if (!equalPath(container.segments, containeePaths)) return false;
    if (!matrixParamsMatch(container.segments, containeePaths, matrixParams)) return false;
    for (const c in containee.children) {
      if (!container.children[c]) return false;
      if (!containsSegmentGroup(container.children[c], containee.children[c], matrixParams)) {
        return false;
      }
    }
    return true;
  } else {
    const current = containeePaths.slice(0, container.segments.length);
    const next = containeePaths.slice(container.segments.length);
    if (!equalPath(container.segments, current)) return false;
    if (!matrixParamsMatch(container.segments, current, matrixParams)) return false;
    if (!container.children[PRIMARY_OUTLET]) return false;
    return containsSegmentGroupHelper(container.children[PRIMARY_OUTLET], containee, next, matrixParams);
  }
}
function matrixParamsMatch(containerPaths, containeePaths, options) {
  return containeePaths.every((containeeSegment, i) => {
    return paramCompareMap[options](containerPaths[i].parameters, containeeSegment.parameters);
  });
}
function equalSegments(as, bs) {
  return equalPath(as, bs) && as.every((a, i) => shallowEqual(a.parameters, bs[i].parameters));
}
function equalPath(as, bs) {
  if (as.length !== bs.length) return false;
  return as.every((a, i) => a.path === bs[i].path);
}
function mapChildrenIntoArray(segment, fn) {
  let res = [];
  Object.entries(segment.children).forEach(([childOutlet, child]) => {
    if (childOutlet === PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  Object.entries(segment.children).forEach(([childOutlet, child]) => {
    if (childOutlet !== PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  return res;
}
function serializePaths(segment) {
  return segment.segments.map((p) => serializePath(p)).join("/");
}
function serializeSegment(segment, root) {
  if (!segment.hasChildren()) {
    return serializePaths(segment);
  }
  if (root) {
    const primary = segment.children[PRIMARY_OUTLET] ? serializeSegment(segment.children[PRIMARY_OUTLET], false) : "";
    const children = [];
    Object.entries(segment.children).forEach(([k, v]) => {
      if (k !== PRIMARY_OUTLET) {
        children.push(`${k}:${serializeSegment(v, false)}`);
      }
    });
    return children.length > 0 ? `${primary}(${children.join("//")})` : primary;
  } else {
    const children = mapChildrenIntoArray(segment, (v, k) => {
      if (k === PRIMARY_OUTLET) {
        return [serializeSegment(segment.children[PRIMARY_OUTLET], false)];
      }
      return [`${k}:${serializeSegment(v, false)}`];
    });
    if (Object.keys(segment.children).length === 1 && segment.children[PRIMARY_OUTLET] != null) {
      return `${serializePaths(segment)}/${children[0]}`;
    }
    return `${serializePaths(segment)}/(${children.join("//")})`;
  }
}
function encodeUriString(s) {
  return encodeURIComponent(s).replace(/%40/g, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",");
}
function encodeUriQuery(s) {
  return encodeUriString(s).replace(/%3B/gi, ";");
}
function encodeUriFragment(s) {
  return encodeURI(s);
}
function encodeUriSegment(s) {
  return encodeUriString(s).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/%26/gi, "&");
}
function decode(s) {
  return decodeURIComponent(s);
}
function decodeQuery(s) {
  return decode(s.replace(/\+/g, "%20"));
}
function serializePath(path) {
  return `${encodeUriSegment(path.path)}${serializeMatrixParams(path.parameters)}`;
}
function serializeMatrixParams(params) {
  return Object.entries(params).map(([key, value]) => `;${encodeUriSegment(key)}=${encodeUriSegment(value)}`).join("");
}
function serializeQueryParams(params) {
  const strParams = Object.entries(params).map(([name, value]) => {
    return Array.isArray(value) ? value.map((v) => `${encodeUriQuery(name)}=${encodeUriQuery(v)}`).join("&") : `${encodeUriQuery(name)}=${encodeUriQuery(value)}`;
  }).filter((s) => s);
  return strParams.length ? `?${strParams.join("&")}` : "";
}
function matchSegments(str) {
  const match2 = str.match(SEGMENT_RE);
  return match2 ? match2[0] : "";
}
function matchMatrixKeySegments(str) {
  const match2 = str.match(MATRIX_PARAM_SEGMENT_RE);
  return match2 ? match2[0] : "";
}
function matchQueryParams(str) {
  const match2 = str.match(QUERY_PARAM_RE);
  return match2 ? match2[0] : "";
}
function matchUrlQueryParamValue(str) {
  const match2 = str.match(QUERY_PARAM_VALUE_RE);
  return match2 ? match2[0] : "";
}
function createRoot(rootCandidate) {
  return rootCandidate.segments.length > 0 ? new UrlSegmentGroup([], {
    [PRIMARY_OUTLET]: rootCandidate
  }) : rootCandidate;
}
function squashSegmentGroup(segmentGroup) {
  const newChildren = {};
  for (const [childOutlet, child] of Object.entries(segmentGroup.children)) {
    const childCandidate = squashSegmentGroup(child);
    if (childOutlet === PRIMARY_OUTLET && childCandidate.segments.length === 0 && childCandidate.hasChildren()) {
      for (const [grandChildOutlet, grandChild] of Object.entries(childCandidate.children)) {
        newChildren[grandChildOutlet] = grandChild;
      }
    } else if (childCandidate.segments.length > 0 || childCandidate.hasChildren()) {
      newChildren[childOutlet] = childCandidate;
    }
  }
  const s = new UrlSegmentGroup(segmentGroup.segments, newChildren);
  return mergeTrivialChildren(s);
}
function mergeTrivialChildren(s) {
  if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
    const c = s.children[PRIMARY_OUTLET];
    return new UrlSegmentGroup(s.segments.concat(c.segments), c.children);
  }
  return s;
}
function isUrlTree(v) {
  return v instanceof UrlTree;
}
function createUrlTreeFromSnapshot(relativeTo, commands, queryParams = null, fragment = null) {
  const relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeTo);
  return createUrlTreeFromSegmentGroup(relativeToUrlSegmentGroup, commands, queryParams, fragment);
}
function createSegmentGroupFromRoute(route) {
  let targetGroup;
  function createSegmentGroupFromRouteRecursive(currentRoute) {
    const childOutlets = {};
    for (const childSnapshot of currentRoute.children) {
      const root = createSegmentGroupFromRouteRecursive(childSnapshot);
      childOutlets[childSnapshot.outlet] = root;
    }
    const segmentGroup = new UrlSegmentGroup(currentRoute.url, childOutlets);
    if (currentRoute === route) {
      targetGroup = segmentGroup;
    }
    return segmentGroup;
  }
  const rootCandidate = createSegmentGroupFromRouteRecursive(route.root);
  const rootSegmentGroup = createRoot(rootCandidate);
  return targetGroup ?? rootSegmentGroup;
}
function createUrlTreeFromSegmentGroup(relativeTo, commands, queryParams, fragment) {
  let root = relativeTo;
  while (root.parent) {
    root = root.parent;
  }
  if (commands.length === 0) {
    return tree(root, root, root, queryParams, fragment);
  }
  const nav = computeNavigation(commands);
  if (nav.toRoot()) {
    return tree(root, root, new UrlSegmentGroup([], {}), queryParams, fragment);
  }
  const position = findStartingPositionForTargetGroup(nav, root, relativeTo);
  const newSegmentGroup = position.processChildren ? updateSegmentGroupChildren(position.segmentGroup, position.index, nav.commands) : updateSegmentGroup(position.segmentGroup, position.index, nav.commands);
  return tree(root, position.segmentGroup, newSegmentGroup, queryParams, fragment);
}
function isMatrixParams(command) {
  return typeof command === "object" && command != null && !command.outlets && !command.segmentPath;
}
function isCommandWithOutlets(command) {
  return typeof command === "object" && command != null && command.outlets;
}
function tree(oldRoot, oldSegmentGroup, newSegmentGroup, queryParams, fragment) {
  let qp = {};
  if (queryParams) {
    Object.entries(queryParams).forEach(([name, value]) => {
      qp[name] = Array.isArray(value) ? value.map((v) => `${v}`) : `${value}`;
    });
  }
  let rootCandidate;
  if (oldRoot === oldSegmentGroup) {
    rootCandidate = newSegmentGroup;
  } else {
    rootCandidate = replaceSegment(oldRoot, oldSegmentGroup, newSegmentGroup);
  }
  const newRoot = createRoot(squashSegmentGroup(rootCandidate));
  return new UrlTree(newRoot, qp, fragment);
}
function replaceSegment(current, oldSegment, newSegment) {
  const children = {};
  Object.entries(current.children).forEach(([outletName, c]) => {
    if (c === oldSegment) {
      children[outletName] = newSegment;
    } else {
      children[outletName] = replaceSegment(c, oldSegment, newSegment);
    }
  });
  return new UrlSegmentGroup(current.segments, children);
}
function computeNavigation(commands) {
  if (typeof commands[0] === "string" && commands.length === 1 && commands[0] === "/") {
    return new Navigation(true, 0, commands);
  }
  let numberOfDoubleDots = 0;
  let isAbsolute = false;
  const res = commands.reduce((res2, cmd, cmdIdx) => {
    if (typeof cmd === "object" && cmd != null) {
      if (cmd.outlets) {
        const outlets = {};
        Object.entries(cmd.outlets).forEach(([name, commands2]) => {
          outlets[name] = typeof commands2 === "string" ? commands2.split("/") : commands2;
        });
        return [...res2, {
          outlets
        }];
      }
      if (cmd.segmentPath) {
        return [...res2, cmd.segmentPath];
      }
    }
    if (!(typeof cmd === "string")) {
      return [...res2, cmd];
    }
    if (cmdIdx === 0) {
      cmd.split("/").forEach((urlPart, partIndex) => {
        if (partIndex == 0 && urlPart === ".") ;
        else if (partIndex == 0 && urlPart === "") {
          isAbsolute = true;
        } else if (urlPart === "..") {
          numberOfDoubleDots++;
        } else if (urlPart != "") {
          res2.push(urlPart);
        }
      });
      return res2;
    }
    return [...res2, cmd];
  }, []);
  return new Navigation(isAbsolute, numberOfDoubleDots, res);
}
function findStartingPositionForTargetGroup(nav, root, target) {
  if (nav.isAbsolute) {
    return new Position(root, true, 0);
  }
  if (!target) {
    return new Position(root, false, NaN);
  }
  if (target.parent === null) {
    return new Position(target, true, 0);
  }
  const modifier = isMatrixParams(nav.commands[0]) ? 0 : 1;
  const index = target.segments.length - 1 + modifier;
  return createPositionApplyingDoubleDots(target, index, nav.numberOfDoubleDots);
}
function createPositionApplyingDoubleDots(group2, index, numberOfDoubleDots) {
  let g = group2;
  let ci = index;
  let dd = numberOfDoubleDots;
  while (dd > ci) {
    dd -= ci;
    g = g.parent;
    if (!g) {
      throw new RuntimeError(4005, (typeof ngDevMode === "undefined" || ngDevMode) && "Invalid number of '../'");
    }
    ci = g.segments.length;
  }
  return new Position(g, false, ci - dd);
}
function getOutlets(commands) {
  if (isCommandWithOutlets(commands[0])) {
    return commands[0].outlets;
  }
  return {
    [PRIMARY_OUTLET]: commands
  };
}
function updateSegmentGroup(segmentGroup, startIndex, commands) {
  segmentGroup ??= new UrlSegmentGroup([], {});
  if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
    return updateSegmentGroupChildren(segmentGroup, startIndex, commands);
  }
  const m = prefixedWith(segmentGroup, startIndex, commands);
  const slicedCommands = commands.slice(m.commandIndex);
  if (m.match && m.pathIndex < segmentGroup.segments.length) {
    const g = new UrlSegmentGroup(segmentGroup.segments.slice(0, m.pathIndex), {});
    g.children[PRIMARY_OUTLET] = new UrlSegmentGroup(segmentGroup.segments.slice(m.pathIndex), segmentGroup.children);
    return updateSegmentGroupChildren(g, 0, slicedCommands);
  } else if (m.match && slicedCommands.length === 0) {
    return new UrlSegmentGroup(segmentGroup.segments, {});
  } else if (m.match && !segmentGroup.hasChildren()) {
    return createNewSegmentGroup(segmentGroup, startIndex, commands);
  } else if (m.match) {
    return updateSegmentGroupChildren(segmentGroup, 0, slicedCommands);
  } else {
    return createNewSegmentGroup(segmentGroup, startIndex, commands);
  }
}
function updateSegmentGroupChildren(segmentGroup, startIndex, commands) {
  if (commands.length === 0) {
    return new UrlSegmentGroup(segmentGroup.segments, {});
  } else {
    const outlets = getOutlets(commands);
    const children = {};
    if (Object.keys(outlets).some((o) => o !== PRIMARY_OUTLET) && segmentGroup.children[PRIMARY_OUTLET] && segmentGroup.numberOfChildren === 1 && segmentGroup.children[PRIMARY_OUTLET].segments.length === 0) {
      const childrenOfEmptyChild = updateSegmentGroupChildren(segmentGroup.children[PRIMARY_OUTLET], startIndex, commands);
      return new UrlSegmentGroup(segmentGroup.segments, childrenOfEmptyChild.children);
    }
    Object.entries(outlets).forEach(([outlet, commands2]) => {
      if (typeof commands2 === "string") {
        commands2 = [commands2];
      }
      if (commands2 !== null) {
        children[outlet] = updateSegmentGroup(segmentGroup.children[outlet], startIndex, commands2);
      }
    });
    Object.entries(segmentGroup.children).forEach(([childOutlet, child]) => {
      if (outlets[childOutlet] === void 0) {
        children[childOutlet] = child;
      }
    });
    return new UrlSegmentGroup(segmentGroup.segments, children);
  }
}
function prefixedWith(segmentGroup, startIndex, commands) {
  let currentCommandIndex = 0;
  let currentPathIndex = startIndex;
  const noMatch2 = {
    match: false,
    pathIndex: 0,
    commandIndex: 0
  };
  while (currentPathIndex < segmentGroup.segments.length) {
    if (currentCommandIndex >= commands.length) return noMatch2;
    const path = segmentGroup.segments[currentPathIndex];
    const command = commands[currentCommandIndex];
    if (isCommandWithOutlets(command)) {
      break;
    }
    const curr = `${command}`;
    const next = currentCommandIndex < commands.length - 1 ? commands[currentCommandIndex + 1] : null;
    if (currentPathIndex > 0 && curr === void 0) break;
    if (curr && next && typeof next === "object" && next.outlets === void 0) {
      if (!compare(curr, next, path)) return noMatch2;
      currentCommandIndex += 2;
    } else {
      if (!compare(curr, {}, path)) return noMatch2;
      currentCommandIndex++;
    }
    currentPathIndex++;
  }
  return {
    match: true,
    pathIndex: currentPathIndex,
    commandIndex: currentCommandIndex
  };
}
function createNewSegmentGroup(segmentGroup, startIndex, commands) {
  const paths = segmentGroup.segments.slice(0, startIndex);
  let i = 0;
  while (i < commands.length) {
    const command = commands[i];
    if (isCommandWithOutlets(command)) {
      const children = createNewSegmentChildren(command.outlets);
      return new UrlSegmentGroup(paths, children);
    }
    if (i === 0 && isMatrixParams(commands[0])) {
      const p = segmentGroup.segments[startIndex];
      paths.push(new UrlSegment(p.path, stringify(commands[0])));
      i++;
      continue;
    }
    const curr = isCommandWithOutlets(command) ? command.outlets[PRIMARY_OUTLET] : `${command}`;
    const next = i < commands.length - 1 ? commands[i + 1] : null;
    if (curr && next && isMatrixParams(next)) {
      paths.push(new UrlSegment(curr, stringify(next)));
      i += 2;
    } else {
      paths.push(new UrlSegment(curr, {}));
      i++;
    }
  }
  return new UrlSegmentGroup(paths, {});
}
function createNewSegmentChildren(outlets) {
  const children = {};
  Object.entries(outlets).forEach(([outlet, commands]) => {
    if (typeof commands === "string") {
      commands = [commands];
    }
    if (commands !== null) {
      children[outlet] = createNewSegmentGroup(new UrlSegmentGroup([], {}), 0, commands);
    }
  });
  return children;
}
function stringify(params) {
  const res = {};
  Object.entries(params).forEach(([k, v]) => res[k] = `${v}`);
  return res;
}
function compare(path, params, segment) {
  return path == segment.path && shallowEqual(params, segment.parameters);
}
function getOrCreateRouteInjectorIfNeeded(route, currentInjector) {
  if (route.providers && !route._injector) {
    route._injector = createEnvironmentInjector(route.providers, currentInjector, `Route: ${route.path}`);
  }
  return route._injector ?? currentInjector;
}
function validateConfig(config, parentPath = "", requireStandaloneComponents = false) {
  for (let i = 0; i < config.length; i++) {
    const route = config[i];
    const fullPath = getFullPath(parentPath, route);
    validateNode(route, fullPath, requireStandaloneComponents);
  }
}
function assertStandalone(fullPath, component) {
  if (component && isNgModule(component)) {
    throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}'. You are using 'loadComponent' with a module, but it must be used with standalone components. Use 'loadChildren' instead.`);
  } else if (component && !isStandalone(component)) {
    throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}'. The component must be standalone.`);
  }
}
function validateNode(route, fullPath, requireStandaloneComponents) {
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    if (!route) {
      throw new RuntimeError(4014, `
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.

      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },, << two commas
        { path: 'detail/:id', component: HeroDetailComponent }
      ];
    `);
    }
    if (Array.isArray(route)) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': Array cannot be specified`);
    }
    if (!route.redirectTo && !route.component && !route.loadComponent && !route.children && !route.loadChildren && route.outlet && route.outlet !== PRIMARY_OUTLET) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`);
    }
    if (route.redirectTo && route.children) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': redirectTo and children cannot be used together`);
    }
    if (route.redirectTo && route.loadChildren) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': redirectTo and loadChildren cannot be used together`);
    }
    if (route.children && route.loadChildren) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': children and loadChildren cannot be used together`);
    }
    if (route.redirectTo && (route.component || route.loadComponent)) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': redirectTo and component/loadComponent cannot be used together`);
    }
    if (route.component && route.loadComponent) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': component and loadComponent cannot be used together`);
    }
    if (route.redirectTo && route.canActivate) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': redirectTo and canActivate cannot be used together. Redirects happen before activation so canActivate will never be executed.`);
    }
    if (route.path && route.matcher) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': path and matcher cannot be used together`);
    }
    if (route.redirectTo === void 0 && !route.component && !route.loadComponent && !route.children && !route.loadChildren) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}'. One of the following must be provided: component, loadComponent, redirectTo, children or loadChildren`);
    }
    if (route.path === void 0 && route.matcher === void 0) {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': routes must have either a path or a matcher specified`);
    }
    if (typeof route.path === "string" && route.path.charAt(0) === "/") {
      throw new RuntimeError(4014, `Invalid configuration of route '${fullPath}': path cannot start with a slash`);
    }
    if (route.path === "" && route.redirectTo !== void 0 && route.pathMatch === void 0) {
      const exp = `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
      throw new RuntimeError(4014, `Invalid configuration of route '{path: "${fullPath}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
    }
    if (requireStandaloneComponents) {
      assertStandalone(fullPath, route.component);
    }
  }
  if (route.children) {
    validateConfig(route.children, fullPath, requireStandaloneComponents);
  }
}
function getFullPath(parentPath, currentRoute) {
  if (!currentRoute) {
    return parentPath;
  }
  if (!parentPath && !currentRoute.path) {
    return "";
  } else if (parentPath && !currentRoute.path) {
    return `${parentPath}/`;
  } else if (!parentPath && currentRoute.path) {
    return currentRoute.path;
  } else {
    return `${parentPath}/${currentRoute.path}`;
  }
}
function getOutlet(route) {
  return route.outlet || PRIMARY_OUTLET;
}
function sortByMatchingOutlets(routes, outletName) {
  const sortedConfig = routes.filter((r) => getOutlet(r) === outletName);
  sortedConfig.push(...routes.filter((r) => getOutlet(r) !== outletName));
  return sortedConfig;
}
function getClosestRouteInjector(snapshot) {
  if (!snapshot) return null;
  if (snapshot.routeConfig?._injector) {
    return snapshot.routeConfig._injector;
  }
  for (let s = snapshot.parent; s; s = s.parent) {
    const route = s.routeConfig;
    if (route?._loadedInjector) return route._loadedInjector;
    if (route?._injector) return route._injector;
  }
  return null;
}
function findNode(value, node) {
  if (value === node.value) return node;
  for (const child of node.children) {
    const node2 = findNode(value, child);
    if (node2) return node2;
  }
  return null;
}
function findPath(value, node) {
  if (value === node.value) return [node];
  for (const child of node.children) {
    const path = findPath(value, child);
    if (path.length) {
      path.unshift(node);
      return path;
    }
  }
  return [];
}
function nodeChildrenAsMap(node) {
  const map2 = {};
  if (node) {
    node.children.forEach((child) => map2[child.value.outlet] = child);
  }
  return map2;
}
function createEmptyState(rootComponent) {
  const snapshot = createEmptyStateSnapshot(rootComponent);
  const emptyUrl = new BehaviorSubject([new UrlSegment("", {})]);
  const emptyParams = new BehaviorSubject({});
  const emptyData = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject("");
  const activated = new ActivatedRoute(emptyUrl, emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, snapshot.root);
  activated.snapshot = snapshot.root;
  return new RouterState(new TreeNode(activated, []), snapshot);
}
function createEmptyStateSnapshot(rootComponent) {
  const emptyParams = {};
  const emptyData = {};
  const emptyQueryParams = {};
  const fragment = "";
  const activated = new ActivatedRouteSnapshot([], emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, null, {});
  return new RouterStateSnapshot("", new TreeNode(activated, []));
}
function getInherited(route, parent, paramsInheritanceStrategy = "emptyOnly") {
  let inherited;
  const {
    routeConfig
  } = route;
  if (parent !== null && (paramsInheritanceStrategy === "always" || // inherit parent data if route is empty path
  routeConfig?.path === "" || // inherit parent data if parent was componentless
  !parent.component && !parent.routeConfig?.loadComponent)) {
    inherited = {
      params: __spreadValues(__spreadValues({}, parent.params), route.params),
      data: __spreadValues(__spreadValues({}, parent.data), route.data),
      resolve: __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, route.data), parent.data), routeConfig?.data), route._resolvedData)
    };
  } else {
    inherited = {
      params: __spreadValues({}, route.params),
      data: __spreadValues({}, route.data),
      resolve: __spreadValues(__spreadValues({}, route.data), route._resolvedData ?? {})
    };
  }
  if (routeConfig && hasStaticTitle(routeConfig)) {
    inherited.resolve[RouteTitleKey] = routeConfig.title;
  }
  return inherited;
}
function setRouterState(state2, node) {
  node.value._routerState = state2;
  node.children.forEach((c) => setRouterState(state2, c));
}
function serializeNode(node) {
  const c = node.children.length > 0 ? ` { ${node.children.map(serializeNode).join(", ")} } ` : "";
  return `${node.value}${c}`;
}
function advanceActivatedRoute(route) {
  if (route.snapshot) {
    const currentSnapshot = route.snapshot;
    const nextSnapshot = route._futureSnapshot;
    route.snapshot = nextSnapshot;
    if (!shallowEqual(currentSnapshot.queryParams, nextSnapshot.queryParams)) {
      route.queryParamsSubject.next(nextSnapshot.queryParams);
    }
    if (currentSnapshot.fragment !== nextSnapshot.fragment) {
      route.fragmentSubject.next(nextSnapshot.fragment);
    }
    if (!shallowEqual(currentSnapshot.params, nextSnapshot.params)) {
      route.paramsSubject.next(nextSnapshot.params);
    }
    if (!shallowEqualArrays(currentSnapshot.url, nextSnapshot.url)) {
      route.urlSubject.next(nextSnapshot.url);
    }
    if (!shallowEqual(currentSnapshot.data, nextSnapshot.data)) {
      route.dataSubject.next(nextSnapshot.data);
    }
  } else {
    route.snapshot = route._futureSnapshot;
    route.dataSubject.next(route._futureSnapshot.data);
  }
}
function equalParamsAndUrlSegments(a, b) {
  const equalUrlParams = shallowEqual(a.params, b.params) && equalSegments(a.url, b.url);
  const parentsMismatch = !a.parent !== !b.parent;
  return equalUrlParams && !parentsMismatch && (!a.parent || equalParamsAndUrlSegments(a.parent, b.parent));
}
function hasStaticTitle(config) {
  return typeof config.title === "string" || config.title === null;
}
function standardizeConfig(r) {
  const children = r.children && r.children.map(standardizeConfig);
  const c = children ? __spreadProps(__spreadValues({}, r), {
    children
  }) : __spreadValues({}, r);
  if (!c.component && !c.loadComponent && (children || c.loadChildren) && c.outlet && c.outlet !== PRIMARY_OUTLET) {
    c.component = \u0275EmptyOutletComponent;
  }
  return c;
}
function createRouterState(routeReuseStrategy, curr, prevState) {
  const root = createNode(routeReuseStrategy, curr._root, prevState ? prevState._root : void 0);
  return new RouterState(root, curr);
}
function createNode(routeReuseStrategy, curr, prevState) {
  if (prevState && routeReuseStrategy.shouldReuseRoute(curr.value, prevState.value.snapshot)) {
    const value = prevState.value;
    value._futureSnapshot = curr.value;
    const children = createOrReuseChildren(routeReuseStrategy, curr, prevState);
    return new TreeNode(value, children);
  } else {
    if (routeReuseStrategy.shouldAttach(curr.value)) {
      const detachedRouteHandle = routeReuseStrategy.retrieve(curr.value);
      if (detachedRouteHandle !== null) {
        const tree2 = detachedRouteHandle.route;
        tree2.value._futureSnapshot = curr.value;
        tree2.children = curr.children.map((c) => createNode(routeReuseStrategy, c));
        return tree2;
      }
    }
    const value = createActivatedRoute(curr.value);
    const children = curr.children.map((c) => createNode(routeReuseStrategy, c));
    return new TreeNode(value, children);
  }
}
function createOrReuseChildren(routeReuseStrategy, curr, prevState) {
  return curr.children.map((child) => {
    for (const p of prevState.children) {
      if (routeReuseStrategy.shouldReuseRoute(child.value, p.value.snapshot)) {
        return createNode(routeReuseStrategy, child, p);
      }
    }
    return createNode(routeReuseStrategy, child);
  });
}
function createActivatedRoute(c) {
  return new ActivatedRoute(new BehaviorSubject(c.url), new BehaviorSubject(c.params), new BehaviorSubject(c.queryParams), new BehaviorSubject(c.fragment), new BehaviorSubject(c.data), c.outlet, c.component, c);
}
function redirectingNavigationError(urlSerializer, redirect) {
  const {
    redirectTo,
    navigationBehaviorOptions
  } = isUrlTree(redirect) ? {
    redirectTo: redirect,
    navigationBehaviorOptions: void 0
  } : redirect;
  const error = navigationCancelingError(ngDevMode && `Redirecting to "${urlSerializer.serialize(redirectTo)}"`, NavigationCancellationCode.Redirect);
  error.url = redirectTo;
  error.navigationBehaviorOptions = navigationBehaviorOptions;
  return error;
}
function navigationCancelingError(message, code) {
  const error = new Error(`NavigationCancelingError: ${message || ""}`);
  error[NAVIGATION_CANCELING_ERROR] = true;
  error.cancellationCode = code;
  return error;
}
function isRedirectingNavigationCancelingError(error) {
  return isNavigationCancelingError(error) && isUrlTree(error.url);
}
function isNavigationCancelingError(error) {
  return !!error && error[NAVIGATION_CANCELING_ERROR];
}
function getAllRouteGuards(future, curr, parentContexts) {
  const futureRoot = future._root;
  const currRoot = curr ? curr._root : null;
  return getChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
}
function getCanActivateChild(p) {
  const canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
  if (!canActivateChild || canActivateChild.length === 0) return null;
  return {
    node: p,
    guards: canActivateChild
  };
}
function getTokenOrFunctionIdentity(tokenOrFunction, injector) {
  const NOT_FOUND = Symbol();
  const result = injector.get(tokenOrFunction, NOT_FOUND);
  if (result === NOT_FOUND) {
    if (typeof tokenOrFunction === "function" && !isInjectable(tokenOrFunction)) {
      return tokenOrFunction;
    } else {
      return injector.get(tokenOrFunction);
    }
  }
  return result;
}
function getChildRouteGuards(futureNode, currNode, contexts, futurePath, checks = {
  canDeactivateChecks: [],
  canActivateChecks: []
}) {
  const prevChildren = nodeChildrenAsMap(currNode);
  futureNode.children.forEach((c) => {
    getRouteGuards(c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]), checks);
    delete prevChildren[c.value.outlet];
  });
  Object.entries(prevChildren).forEach(([k, v]) => deactivateRouteAndItsChildren(v, contexts.getContext(k), checks));
  return checks;
}
function getRouteGuards(futureNode, currNode, parentContexts, futurePath, checks = {
  canDeactivateChecks: [],
  canActivateChecks: []
}) {
  const future = futureNode.value;
  const curr = currNode ? currNode.value : null;
  const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;
  if (curr && future.routeConfig === curr.routeConfig) {
    const shouldRun = shouldRunGuardsAndResolvers(curr, future, future.routeConfig.runGuardsAndResolvers);
    if (shouldRun) {
      checks.canActivateChecks.push(new CanActivate(futurePath));
    } else {
      future.data = curr.data;
      future._resolvedData = curr._resolvedData;
    }
    if (future.component) {
      getChildRouteGuards(futureNode, currNode, context ? context.children : null, futurePath, checks);
    } else {
      getChildRouteGuards(futureNode, currNode, parentContexts, futurePath, checks);
    }
    if (shouldRun && context && context.outlet && context.outlet.isActivated) {
      checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, curr));
    }
  } else {
    if (curr) {
      deactivateRouteAndItsChildren(currNode, context, checks);
    }
    checks.canActivateChecks.push(new CanActivate(futurePath));
    if (future.component) {
      getChildRouteGuards(futureNode, null, context ? context.children : null, futurePath, checks);
    } else {
      getChildRouteGuards(futureNode, null, parentContexts, futurePath, checks);
    }
  }
  return checks;
}
function shouldRunGuardsAndResolvers(curr, future, mode) {
  if (typeof mode === "function") {
    return mode(curr, future);
  }
  switch (mode) {
    case "pathParamsChange":
      return !equalPath(curr.url, future.url);
    case "pathParamsOrQueryParamsChange":
      return !equalPath(curr.url, future.url) || !shallowEqual(curr.queryParams, future.queryParams);
    case "always":
      return true;
    case "paramsOrQueryParamsChange":
      return !equalParamsAndUrlSegments(curr, future) || !shallowEqual(curr.queryParams, future.queryParams);
    case "paramsChange":
    default:
      return !equalParamsAndUrlSegments(curr, future);
  }
}
function deactivateRouteAndItsChildren(route, context, checks) {
  const children = nodeChildrenAsMap(route);
  const r = route.value;
  Object.entries(children).forEach(([childName, node]) => {
    if (!r.component) {
      deactivateRouteAndItsChildren(node, context, checks);
    } else if (context) {
      deactivateRouteAndItsChildren(node, context.children.getContext(childName), checks);
    } else {
      deactivateRouteAndItsChildren(node, null, checks);
    }
  });
  if (!r.component) {
    checks.canDeactivateChecks.push(new CanDeactivate(null, r));
  } else if (context && context.outlet && context.outlet.isActivated) {
    checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, r));
  } else {
    checks.canDeactivateChecks.push(new CanDeactivate(null, r));
  }
}
function isFunction(v) {
  return typeof v === "function";
}
function isBoolean(v) {
  return typeof v === "boolean";
}
function isCanLoad(guard) {
  return guard && isFunction(guard.canLoad);
}
function isCanActivate(guard) {
  return guard && isFunction(guard.canActivate);
}
function isCanActivateChild(guard) {
  return guard && isFunction(guard.canActivateChild);
}
function isCanDeactivate(guard) {
  return guard && isFunction(guard.canDeactivate);
}
function isCanMatch(guard) {
  return guard && isFunction(guard.canMatch);
}
function isEmptyError(e) {
  return e instanceof EmptyError || e?.name === "EmptyError";
}
function prioritizedGuardValue() {
  return switchMap((obs) => {
    return combineLatest(obs.map((o) => o.pipe(take(1), startWith(INITIAL_VALUE)))).pipe(map((results) => {
      for (const result of results) {
        if (result === true) {
          continue;
        } else if (result === INITIAL_VALUE) {
          return INITIAL_VALUE;
        } else if (result === false || isRedirect(result)) {
          return result;
        }
      }
      return true;
    }), filter((item) => item !== INITIAL_VALUE), take(1));
  });
}
function isRedirect(val) {
  return isUrlTree(val) || val instanceof RedirectCommand;
}
function checkGuards(injector, forwardEvent) {
  return mergeMap((t) => {
    const {
      targetSnapshot,
      currentSnapshot,
      guards: {
        canActivateChecks,
        canDeactivateChecks
      }
    } = t;
    if (canDeactivateChecks.length === 0 && canActivateChecks.length === 0) {
      return of(__spreadProps(__spreadValues({}, t), {
        guardsResult: true
      }));
    }
    return runCanDeactivateChecks(canDeactivateChecks, targetSnapshot, currentSnapshot, injector).pipe(mergeMap((canDeactivate) => {
      return canDeactivate && isBoolean(canDeactivate) ? runCanActivateChecks(targetSnapshot, canActivateChecks, injector, forwardEvent) : of(canDeactivate);
    }), map((guardsResult) => __spreadProps(__spreadValues({}, t), {
      guardsResult
    })));
  });
}
function runCanDeactivateChecks(checks, futureRSS, currRSS, injector) {
  return from(checks).pipe(mergeMap((check) => runCanDeactivate(check.component, check.route, currRSS, futureRSS, injector)), first((result) => {
    return result !== true;
  }, true));
}
function runCanActivateChecks(futureSnapshot, checks, injector, forwardEvent) {
  return from(checks).pipe(concatMap((check) => {
    return concat(fireChildActivationStart(check.route.parent, forwardEvent), fireActivationStart(check.route, forwardEvent), runCanActivateChild(futureSnapshot, check.path, injector), runCanActivate(futureSnapshot, check.route, injector));
  }), first((result) => {
    return result !== true;
  }, true));
}
function fireActivationStart(snapshot, forwardEvent) {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ActivationStart(snapshot));
  }
  return of(true);
}
function fireChildActivationStart(snapshot, forwardEvent) {
  if (snapshot !== null && forwardEvent) {
    forwardEvent(new ChildActivationStart(snapshot));
  }
  return of(true);
}
function runCanActivate(futureRSS, futureARS, injector) {
  const canActivate = futureARS.routeConfig ? futureARS.routeConfig.canActivate : null;
  if (!canActivate || canActivate.length === 0) return of(true);
  const canActivateObservables = canActivate.map((canActivate2) => {
    return defer(() => {
      const closestInjector = getClosestRouteInjector(futureARS) ?? injector;
      const guard = getTokenOrFunctionIdentity(canActivate2, closestInjector);
      const guardVal = isCanActivate(guard) ? guard.canActivate(futureARS, futureRSS) : runInInjectionContext(closestInjector, () => guard(futureARS, futureRSS));
      return wrapIntoObservable(guardVal).pipe(first());
    });
  });
  return of(canActivateObservables).pipe(prioritizedGuardValue());
}
function runCanActivateChild(futureRSS, path, injector) {
  const futureARS = path[path.length - 1];
  const canActivateChildGuards = path.slice(0, path.length - 1).reverse().map((p) => getCanActivateChild(p)).filter((_) => _ !== null);
  const canActivateChildGuardsMapped = canActivateChildGuards.map((d) => {
    return defer(() => {
      const guardsMapped = d.guards.map((canActivateChild) => {
        const closestInjector = getClosestRouteInjector(d.node) ?? injector;
        const guard = getTokenOrFunctionIdentity(canActivateChild, closestInjector);
        const guardVal = isCanActivateChild(guard) ? guard.canActivateChild(futureARS, futureRSS) : runInInjectionContext(closestInjector, () => guard(futureARS, futureRSS));
        return wrapIntoObservable(guardVal).pipe(first());
      });
      return of(guardsMapped).pipe(prioritizedGuardValue());
    });
  });
  return of(canActivateChildGuardsMapped).pipe(prioritizedGuardValue());
}
function runCanDeactivate(component, currARS, currRSS, futureRSS, injector) {
  const canDeactivate = currARS && currARS.routeConfig ? currARS.routeConfig.canDeactivate : null;
  if (!canDeactivate || canDeactivate.length === 0) return of(true);
  const canDeactivateObservables = canDeactivate.map((c) => {
    const closestInjector = getClosestRouteInjector(currARS) ?? injector;
    const guard = getTokenOrFunctionIdentity(c, closestInjector);
    const guardVal = isCanDeactivate(guard) ? guard.canDeactivate(component, currARS, currRSS, futureRSS) : runInInjectionContext(closestInjector, () => guard(component, currARS, currRSS, futureRSS));
    return wrapIntoObservable(guardVal).pipe(first());
  });
  return of(canDeactivateObservables).pipe(prioritizedGuardValue());
}
function runCanLoadGuards(injector, route, segments, urlSerializer) {
  const canLoad = route.canLoad;
  if (canLoad === void 0 || canLoad.length === 0) {
    return of(true);
  }
  const canLoadObservables = canLoad.map((injectionToken) => {
    const guard = getTokenOrFunctionIdentity(injectionToken, injector);
    const guardVal = isCanLoad(guard) ? guard.canLoad(route, segments) : runInInjectionContext(injector, () => guard(route, segments));
    return wrapIntoObservable(guardVal);
  });
  return of(canLoadObservables).pipe(prioritizedGuardValue(), redirectIfUrlTree(urlSerializer));
}
function redirectIfUrlTree(urlSerializer) {
  return pipe(tap((result) => {
    if (typeof result === "boolean") return;
    throw redirectingNavigationError(urlSerializer, result);
  }), map((result) => result === true));
}
function runCanMatchGuards(injector, route, segments, urlSerializer) {
  const canMatch = route.canMatch;
  if (!canMatch || canMatch.length === 0) return of(true);
  const canMatchObservables = canMatch.map((injectionToken) => {
    const guard = getTokenOrFunctionIdentity(injectionToken, injector);
    const guardVal = isCanMatch(guard) ? guard.canMatch(route, segments) : runInInjectionContext(injector, () => guard(route, segments));
    return wrapIntoObservable(guardVal);
  });
  return of(canMatchObservables).pipe(prioritizedGuardValue(), redirectIfUrlTree(urlSerializer));
}
function noMatch$1(segmentGroup) {
  return throwError(new NoMatch(segmentGroup));
}
function namedOutletsRedirect(redirectTo) {
  return throwError(new RuntimeError(4e3, (typeof ngDevMode === "undefined" || ngDevMode) && `Only absolute redirects can have named outlets. redirectTo: '${redirectTo}'`));
}
function canLoadFails(route) {
  return throwError(navigationCancelingError((typeof ngDevMode === "undefined" || ngDevMode) && `Cannot load children because the guard of the route "path: '${route.path}'" returned false`, NavigationCancellationCode.GuardRejected));
}
function matchWithChecks(segmentGroup, route, segments, injector, urlSerializer) {
  const result = match(segmentGroup, route, segments);
  if (!result.matched) {
    return of(result);
  }
  injector = getOrCreateRouteInjectorIfNeeded(route, injector);
  return runCanMatchGuards(injector, route, segments, urlSerializer).pipe(map((v) => v === true ? result : __spreadValues({}, noMatch)));
}
function match(segmentGroup, route, segments) {
  if (route.path === "**") {
    return createWildcardMatchResult(segments);
  }
  if (route.path === "") {
    if (route.pathMatch === "full" && (segmentGroup.hasChildren() || segments.length > 0)) {
      return __spreadValues({}, noMatch);
    }
    return {
      matched: true,
      consumedSegments: [],
      remainingSegments: segments,
      parameters: {},
      positionalParamSegments: {}
    };
  }
  const matcher = route.matcher || defaultUrlMatcher;
  const res = matcher(segments, segmentGroup, route);
  if (!res) return __spreadValues({}, noMatch);
  const posParams = {};
  Object.entries(res.posParams ?? {}).forEach(([k, v]) => {
    posParams[k] = v.path;
  });
  const parameters = res.consumed.length > 0 ? __spreadValues(__spreadValues({}, posParams), res.consumed[res.consumed.length - 1].parameters) : posParams;
  return {
    matched: true,
    consumedSegments: res.consumed,
    remainingSegments: segments.slice(res.consumed.length),
    // TODO(atscott): investigate combining parameters and positionalParamSegments
    parameters,
    positionalParamSegments: res.posParams ?? {}
  };
}
function createWildcardMatchResult(segments) {
  return {
    matched: true,
    parameters: segments.length > 0 ? last2(segments).parameters : {},
    consumedSegments: segments,
    remainingSegments: [],
    positionalParamSegments: {}
  };
}
function split(segmentGroup, consumedSegments, slicedSegments, config) {
  if (slicedSegments.length > 0 && containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)) {
    const s2 = new UrlSegmentGroup(consumedSegments, createChildrenForEmptyPaths(config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
    return {
      segmentGroup: s2,
      slicedSegments: []
    };
  }
  if (slicedSegments.length === 0 && containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
    const s2 = new UrlSegmentGroup(segmentGroup.segments, addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, config, segmentGroup.children));
    return {
      segmentGroup: s2,
      slicedSegments
    };
  }
  const s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
  return {
    segmentGroup: s,
    slicedSegments
  };
}
function addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, routes, children) {
  const res = {};
  for (const r of routes) {
    if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      const s = new UrlSegmentGroup([], {});
      res[getOutlet(r)] = s;
    }
  }
  return __spreadValues(__spreadValues({}, children), res);
}
function createChildrenForEmptyPaths(routes, primarySegment) {
  const res = {};
  res[PRIMARY_OUTLET] = primarySegment;
  for (const r of routes) {
    if (r.path === "" && getOutlet(r) !== PRIMARY_OUTLET) {
      const s = new UrlSegmentGroup([], {});
      res[getOutlet(r)] = s;
    }
  }
  return res;
}
function containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, routes) {
  return routes.some((r) => emptyPathMatch(segmentGroup, slicedSegments, r) && getOutlet(r) !== PRIMARY_OUTLET);
}
function containsEmptyPathMatches(segmentGroup, slicedSegments, routes) {
  return routes.some((r) => emptyPathMatch(segmentGroup, slicedSegments, r));
}
function emptyPathMatch(segmentGroup, slicedSegments, r) {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === "full") {
    return false;
  }
  return r.path === "";
}
function noLeftoversInUrl(segmentGroup, segments, outlet) {
  return segments.length === 0 && !segmentGroup.children[outlet];
}
function recognize$1(injector, configLoader, rootComponentType, config, urlTree, urlSerializer, paramsInheritanceStrategy = "emptyOnly") {
  return new Recognizer(injector, configLoader, rootComponentType, config, urlTree, paramsInheritanceStrategy, urlSerializer).recognize();
}
function sortActivatedRouteSnapshots(nodes) {
  nodes.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
}
function hasEmptyPathConfig(node) {
  const config = node.value.routeConfig;
  return config && config.path === "";
}
function mergeEmptyPathMatches(nodes) {
  const result = [];
  const mergedNodes = /* @__PURE__ */ new Set();
  for (const node of nodes) {
    if (!hasEmptyPathConfig(node)) {
      result.push(node);
      continue;
    }
    const duplicateEmptyPathNode = result.find((resultNode) => node.value.routeConfig === resultNode.value.routeConfig);
    if (duplicateEmptyPathNode !== void 0) {
      duplicateEmptyPathNode.children.push(...node.children);
      mergedNodes.add(duplicateEmptyPathNode);
    } else {
      result.push(node);
    }
  }
  for (const mergedNode of mergedNodes) {
    const mergedChildren = mergeEmptyPathMatches(mergedNode.children);
    result.push(new TreeNode(mergedNode.value, mergedChildren));
  }
  return result.filter((n) => !mergedNodes.has(n));
}
function checkOutletNameUniqueness(nodes) {
  const names = {};
  nodes.forEach((n) => {
    const routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.url.map((s) => s.toString()).join("/");
      const c = n.value.url.map((s) => s.toString()).join("/");
      throw new RuntimeError(4006, (typeof ngDevMode === "undefined" || ngDevMode) && `Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
}
function getData(route) {
  return route.data || {};
}
function getResolve(route) {
  return route.resolve || {};
}
function recognize(injector, configLoader, rootComponentType, config, serializer, paramsInheritanceStrategy) {
  return mergeMap((t) => recognize$1(injector, configLoader, rootComponentType, config, t.extractedUrl, serializer, paramsInheritanceStrategy).pipe(map(({
    state: targetSnapshot,
    tree: urlAfterRedirects
  }) => {
    return __spreadProps(__spreadValues({}, t), {
      targetSnapshot,
      urlAfterRedirects
    });
  })));
}
function resolveData(paramsInheritanceStrategy, injector) {
  return mergeMap((t) => {
    const {
      targetSnapshot,
      guards: {
        canActivateChecks
      }
    } = t;
    if (!canActivateChecks.length) {
      return of(t);
    }
    const routesWithResolversToRun = new Set(canActivateChecks.map((check) => check.route));
    const routesNeedingDataUpdates = /* @__PURE__ */ new Set();
    for (const route of routesWithResolversToRun) {
      if (routesNeedingDataUpdates.has(route)) {
        continue;
      }
      for (const newRoute of flattenRouteTree(route)) {
        routesNeedingDataUpdates.add(newRoute);
      }
    }
    let routesProcessed = 0;
    return from(routesNeedingDataUpdates).pipe(concatMap((route) => {
      if (routesWithResolversToRun.has(route)) {
        return runResolve(route, targetSnapshot, paramsInheritanceStrategy, injector);
      } else {
        route.data = getInherited(route, route.parent, paramsInheritanceStrategy).resolve;
        return of(void 0);
      }
    }), tap(() => routesProcessed++), takeLast(1), mergeMap((_) => routesProcessed === routesNeedingDataUpdates.size ? of(t) : EMPTY));
  });
}
function flattenRouteTree(route) {
  const descendants = route.children.map((child) => flattenRouteTree(child)).flat();
  return [route, ...descendants];
}
function runResolve(futureARS, futureRSS, paramsInheritanceStrategy, injector) {
  const config = futureARS.routeConfig;
  const resolve2 = futureARS._resolve;
  if (config?.title !== void 0 && !hasStaticTitle(config)) {
    resolve2[RouteTitleKey] = config.title;
  }
  return resolveNode(resolve2, futureARS, futureRSS, injector).pipe(map((resolvedData) => {
    futureARS._resolvedData = resolvedData;
    futureARS.data = getInherited(futureARS, futureARS.parent, paramsInheritanceStrategy).resolve;
    return null;
  }));
}
function resolveNode(resolve2, futureARS, futureRSS, injector) {
  const keys = getDataKeys(resolve2);
  if (keys.length === 0) {
    return of({});
  }
  const data = {};
  return from(keys).pipe(mergeMap((key) => getResolver(resolve2[key], futureARS, futureRSS, injector).pipe(first(), tap((value) => {
    if (value instanceof RedirectCommand) {
      throw redirectingNavigationError(new DefaultUrlSerializer(), value);
    }
    data[key] = value;
  }))), takeLast(1), map(() => data), catchError((e) => isEmptyError(e) ? EMPTY : throwError(e)));
}
function getResolver(injectionToken, futureARS, futureRSS, injector) {
  const closestInjector = getClosestRouteInjector(futureARS) ?? injector;
  const resolver = getTokenOrFunctionIdentity(injectionToken, closestInjector);
  const resolverValue = resolver.resolve ? resolver.resolve(futureARS, futureRSS) : runInInjectionContext(closestInjector, () => resolver(futureARS, futureRSS));
  return wrapIntoObservable(resolverValue);
}
function switchTap(next) {
  return switchMap((v) => {
    const nextResult = next(v);
    if (nextResult) {
      return from(nextResult).pipe(map(() => v));
    }
    return of(v);
  });
}
function loadChildren(route, compiler, parentInjector, onLoadEndListener) {
  return wrapIntoObservable(route.loadChildren()).pipe(map(maybeUnwrapDefaultExport), mergeMap((t) => {
    if (t instanceof NgModuleFactory$1 || Array.isArray(t)) {
      return of(t);
    } else {
      return from(compiler.compileModuleAsync(t));
    }
  }), map((factoryOrRoutes) => {
    if (onLoadEndListener) {
      onLoadEndListener(route);
    }
    let injector;
    let rawRoutes;
    let requireStandaloneComponents = false;
    if (Array.isArray(factoryOrRoutes)) {
      rawRoutes = factoryOrRoutes;
      requireStandaloneComponents = true;
    } else {
      injector = factoryOrRoutes.create(parentInjector).injector;
      rawRoutes = injector.get(ROUTES, [], {
        optional: true,
        self: true
      }).flat();
    }
    const routes = rawRoutes.map(standardizeConfig);
    (typeof ngDevMode === "undefined" || ngDevMode) && validateConfig(routes, route.path, requireStandaloneComponents);
    return {
      routes,
      injector
    };
  }));
}
function isWrappedDefaultExport(value) {
  return value && typeof value === "object" && "default" in value;
}
function maybeUnwrapDefaultExport(input2) {
  return isWrappedDefaultExport(input2) ? input2["default"] : input2;
}
function isBrowserTriggeredNavigation(source) {
  return source !== IMPERATIVE_NAVIGATION;
}
function afterNextNavigation(router, action) {
  router.events.pipe(filter((e) => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError || e instanceof NavigationSkipped), map((e) => {
    if (e instanceof NavigationEnd || e instanceof NavigationSkipped) {
      return 0;
    }
    const redirecting = e instanceof NavigationCancel ? e.code === NavigationCancellationCode.Redirect || e.code === NavigationCancellationCode.SupersededByNewNavigation : false;
    return redirecting ? 2 : 1;
  }), filter(
    (result) => result !== 2
    /* NavigationResult.REDIRECTING */
  ), take(1)).subscribe(() => {
    action();
  });
}
function validateCommands(commands) {
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd == null) {
      throw new RuntimeError(4008, (typeof ngDevMode === "undefined" || ngDevMode) && `The requested path contains ${cmd} segment at index ${i}`);
    }
  }
}
function isPublicRouterEvent(e) {
  return !(e instanceof BeforeActivateRoutes) && !(e instanceof RedirectRequest);
}
var PRIMARY_OUTLET, RouteTitleKey, ParamsAsMap, pathCompareMap, paramCompareMap, UrlTree, UrlSegmentGroup, UrlSegment, UrlSerializer, DefaultUrlSerializer, DEFAULT_SERIALIZER, SEGMENT_RE, MATRIX_PARAM_SEGMENT_RE, QUERY_PARAM_RE, QUERY_PARAM_VALUE_RE, UrlParser, Navigation, Position, IMPERATIVE_NAVIGATION, EventType, RouterEvent, NavigationStart, NavigationEnd, NavigationCancellationCode, NavigationSkippedCode, NavigationCancel, NavigationSkipped, NavigationError, RoutesRecognized, GuardsCheckStart, GuardsCheckEnd, ResolveStart, ResolveEnd, RouteConfigLoadStart, RouteConfigLoadEnd, ChildActivationStart, ChildActivationEnd, ActivationStart, ActivationEnd, BeforeActivateRoutes, RedirectRequest, OutletContext, ChildrenOutletContexts, Tree, TreeNode, RouterState, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot, ROUTER_OUTLET_DATA, RouterOutlet, OutletInjector, INPUT_BINDER, RoutedComponentInputBinder, \u0275EmptyOutletComponent, RedirectCommand, NAVIGATION_CANCELING_ERROR, warnedAboutUnsupportedInputBinding, activateRoutes, ActivateRoutes, CanActivate, CanDeactivate, INITIAL_VALUE, NoMatch, AbsoluteRedirect, ApplyRedirects, noMatch, NoLeftoversInUrl, MAX_ALLOWED_REDIRECTS, Recognizer, TitleStrategy, DefaultTitleStrategy, ROUTER_CONFIGURATION, ROUTES, RouterConfigLoader, UrlHandlingStrategy, DefaultUrlHandlingStrategy, CREATE_VIEW_TRANSITION, VIEW_TRANSITION_OPTIONS, NAVIGATION_ERROR_HANDLER, NavigationTransitions, RouteReuseStrategy, BaseRouteReuseStrategy, DefaultRouteReuseStrategy, StateManager, HistoryStateManager, exactMatchOptions, subsetMatchOptions, Router;
var init_router_Dwfin5Au = __esm({
  "node_modules/@angular/router/fesm2022/router-Dwfin5Au.mjs"() {
    "use strict";
    init_common();
    init_core();
    init_core();
    init_esm();
    init_operators();
    init_platform_browser();
    PRIMARY_OUTLET = "primary";
    RouteTitleKey = /* @__PURE__ */ Symbol("RouteTitle");
    ParamsAsMap = class {
      params;
      constructor(params) {
        this.params = params || {};
      }
      has(name) {
        return Object.prototype.hasOwnProperty.call(this.params, name);
      }
      get(name) {
        if (this.has(name)) {
          const v = this.params[name];
          return Array.isArray(v) ? v[0] : v;
        }
        return null;
      }
      getAll(name) {
        if (this.has(name)) {
          const v = this.params[name];
          return Array.isArray(v) ? v : [v];
        }
        return [];
      }
      get keys() {
        return Object.keys(this.params);
      }
    };
    pathCompareMap = {
      "exact": equalSegmentGroups,
      "subset": containsSegmentGroup
    };
    paramCompareMap = {
      "exact": equalParams,
      "subset": containsParams,
      "ignored": () => true
    };
    UrlTree = class {
      root;
      queryParams;
      fragment;
      /** @internal */
      _queryParamMap;
      constructor(root = new UrlSegmentGroup([], {}), queryParams = {}, fragment = null) {
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          if (root.segments.length > 0) {
            throw new RuntimeError(4015, "The root `UrlSegmentGroup` should not contain `segments`. Instead, these segments belong in the `children` so they can be associated with a named outlet.");
          }
        }
      }
      get queryParamMap() {
        this._queryParamMap ??= convertToParamMap(this.queryParams);
        return this._queryParamMap;
      }
      /** @docsNotRequired */
      toString() {
        return DEFAULT_SERIALIZER.serialize(this);
      }
    };
    UrlSegmentGroup = class {
      segments;
      children;
      /** The parent node in the url tree */
      parent = null;
      constructor(segments, children) {
        this.segments = segments;
        this.children = children;
        Object.values(children).forEach((v) => v.parent = this);
      }
      /** Whether the segment has child segments */
      hasChildren() {
        return this.numberOfChildren > 0;
      }
      /** Number of child segments */
      get numberOfChildren() {
        return Object.keys(this.children).length;
      }
      /** @docsNotRequired */
      toString() {
        return serializePaths(this);
      }
    };
    UrlSegment = class {
      path;
      parameters;
      /** @internal */
      _parameterMap;
      constructor(path, parameters) {
        this.path = path;
        this.parameters = parameters;
      }
      get parameterMap() {
        this._parameterMap ??= convertToParamMap(this.parameters);
        return this._parameterMap;
      }
      /** @docsNotRequired */
      toString() {
        return serializePath(this);
      }
    };
    UrlSerializer = class _UrlSerializer {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _UrlSerializer,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _UrlSerializer,
        providedIn: "root",
        useFactory: () => new DefaultUrlSerializer()
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: UrlSerializer,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root",
          useFactory: () => new DefaultUrlSerializer()
        }]
      }]
    });
    DefaultUrlSerializer = class {
      /** Parses a url into a `UrlTree` */
      parse(url) {
        const p = new UrlParser(url);
        return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
      }
      /** Converts a `UrlTree` into a url */
      serialize(tree2) {
        const segment = `/${serializeSegment(tree2.root, true)}`;
        const query2 = serializeQueryParams(tree2.queryParams);
        const fragment = typeof tree2.fragment === `string` ? `#${encodeUriFragment(tree2.fragment)}` : "";
        return `${segment}${query2}${fragment}`;
      }
    };
    DEFAULT_SERIALIZER = new DefaultUrlSerializer();
    SEGMENT_RE = /^[^\/()?;#]+/;
    MATRIX_PARAM_SEGMENT_RE = /^[^\/()?;=#]+/;
    QUERY_PARAM_RE = /^[^=?&#]+/;
    QUERY_PARAM_VALUE_RE = /^[^&#]+/;
    UrlParser = class {
      url;
      remaining;
      constructor(url) {
        this.url = url;
        this.remaining = url;
      }
      parseRootSegment() {
        this.consumeOptional("/");
        if (this.remaining === "" || this.peekStartsWith("?") || this.peekStartsWith("#")) {
          return new UrlSegmentGroup([], {});
        }
        return new UrlSegmentGroup([], this.parseChildren());
      }
      parseQueryParams() {
        const params = {};
        if (this.consumeOptional("?")) {
          do {
            this.parseQueryParam(params);
          } while (this.consumeOptional("&"));
        }
        return params;
      }
      parseFragment() {
        return this.consumeOptional("#") ? decodeURIComponent(this.remaining) : null;
      }
      parseChildren() {
        if (this.remaining === "") {
          return {};
        }
        this.consumeOptional("/");
        const segments = [];
        if (!this.peekStartsWith("(")) {
          segments.push(this.parseSegment());
        }
        while (this.peekStartsWith("/") && !this.peekStartsWith("//") && !this.peekStartsWith("/(")) {
          this.capture("/");
          segments.push(this.parseSegment());
        }
        let children = {};
        if (this.peekStartsWith("/(")) {
          this.capture("/");
          children = this.parseParens(true);
        }
        let res = {};
        if (this.peekStartsWith("(")) {
          res = this.parseParens(false);
        }
        if (segments.length > 0 || Object.keys(children).length > 0) {
          res[PRIMARY_OUTLET] = new UrlSegmentGroup(segments, children);
        }
        return res;
      }
      // parse a segment with its matrix parameters
      // ie `name;k1=v1;k2`
      parseSegment() {
        const path = matchSegments(this.remaining);
        if (path === "" && this.peekStartsWith(";")) {
          throw new RuntimeError(4009, (typeof ngDevMode === "undefined" || ngDevMode) && `Empty path url segment cannot have parameters: '${this.remaining}'.`);
        }
        this.capture(path);
        return new UrlSegment(decode(path), this.parseMatrixParams());
      }
      parseMatrixParams() {
        const params = {};
        while (this.consumeOptional(";")) {
          this.parseParam(params);
        }
        return params;
      }
      parseParam(params) {
        const key = matchMatrixKeySegments(this.remaining);
        if (!key) {
          return;
        }
        this.capture(key);
        let value = "";
        if (this.consumeOptional("=")) {
          const valueMatch = matchSegments(this.remaining);
          if (valueMatch) {
            value = valueMatch;
            this.capture(value);
          }
        }
        params[decode(key)] = decode(value);
      }
      // Parse a single query parameter `name[=value]`
      parseQueryParam(params) {
        const key = matchQueryParams(this.remaining);
        if (!key) {
          return;
        }
        this.capture(key);
        let value = "";
        if (this.consumeOptional("=")) {
          const valueMatch = matchUrlQueryParamValue(this.remaining);
          if (valueMatch) {
            value = valueMatch;
            this.capture(value);
          }
        }
        const decodedKey = decodeQuery(key);
        const decodedVal = decodeQuery(value);
        if (params.hasOwnProperty(decodedKey)) {
          let currentVal = params[decodedKey];
          if (!Array.isArray(currentVal)) {
            currentVal = [currentVal];
            params[decodedKey] = currentVal;
          }
          currentVal.push(decodedVal);
        } else {
          params[decodedKey] = decodedVal;
        }
      }
      // parse `(a/b//outlet_name:c/d)`
      parseParens(allowPrimary) {
        const segments = {};
        this.capture("(");
        while (!this.consumeOptional(")") && this.remaining.length > 0) {
          const path = matchSegments(this.remaining);
          const next = this.remaining[path.length];
          if (next !== "/" && next !== ")" && next !== ";") {
            throw new RuntimeError(4010, (typeof ngDevMode === "undefined" || ngDevMode) && `Cannot parse url '${this.url}'`);
          }
          let outletName = void 0;
          if (path.indexOf(":") > -1) {
            outletName = path.slice(0, path.indexOf(":"));
            this.capture(outletName);
            this.capture(":");
          } else if (allowPrimary) {
            outletName = PRIMARY_OUTLET;
          }
          const children = this.parseChildren();
          segments[outletName] = Object.keys(children).length === 1 ? children[PRIMARY_OUTLET] : new UrlSegmentGroup([], children);
          this.consumeOptional("//");
        }
        return segments;
      }
      peekStartsWith(str) {
        return this.remaining.startsWith(str);
      }
      // Consumes the prefix when it is present and returns whether it has been consumed
      consumeOptional(str) {
        if (this.peekStartsWith(str)) {
          this.remaining = this.remaining.substring(str.length);
          return true;
        }
        return false;
      }
      capture(str) {
        if (!this.consumeOptional(str)) {
          throw new RuntimeError(4011, (typeof ngDevMode === "undefined" || ngDevMode) && `Expected "${str}".`);
        }
      }
    };
    Navigation = class {
      isAbsolute;
      numberOfDoubleDots;
      commands;
      constructor(isAbsolute, numberOfDoubleDots, commands) {
        this.isAbsolute = isAbsolute;
        this.numberOfDoubleDots = numberOfDoubleDots;
        this.commands = commands;
        if (isAbsolute && commands.length > 0 && isMatrixParams(commands[0])) {
          throw new RuntimeError(4003, (typeof ngDevMode === "undefined" || ngDevMode) && "Root segment cannot have matrix parameters");
        }
        const cmdWithOutlet = commands.find(isCommandWithOutlets);
        if (cmdWithOutlet && cmdWithOutlet !== last2(commands)) {
          throw new RuntimeError(4004, (typeof ngDevMode === "undefined" || ngDevMode) && "{outlets:{}} has to be the last command");
        }
      }
      toRoot() {
        return this.isAbsolute && this.commands.length === 1 && this.commands[0] == "/";
      }
    };
    Position = class {
      segmentGroup;
      processChildren;
      index;
      constructor(segmentGroup, processChildren, index) {
        this.segmentGroup = segmentGroup;
        this.processChildren = processChildren;
        this.index = index;
      }
    };
    IMPERATIVE_NAVIGATION = "imperative";
    (function(EventType2) {
      EventType2[EventType2["NavigationStart"] = 0] = "NavigationStart";
      EventType2[EventType2["NavigationEnd"] = 1] = "NavigationEnd";
      EventType2[EventType2["NavigationCancel"] = 2] = "NavigationCancel";
      EventType2[EventType2["NavigationError"] = 3] = "NavigationError";
      EventType2[EventType2["RoutesRecognized"] = 4] = "RoutesRecognized";
      EventType2[EventType2["ResolveStart"] = 5] = "ResolveStart";
      EventType2[EventType2["ResolveEnd"] = 6] = "ResolveEnd";
      EventType2[EventType2["GuardsCheckStart"] = 7] = "GuardsCheckStart";
      EventType2[EventType2["GuardsCheckEnd"] = 8] = "GuardsCheckEnd";
      EventType2[EventType2["RouteConfigLoadStart"] = 9] = "RouteConfigLoadStart";
      EventType2[EventType2["RouteConfigLoadEnd"] = 10] = "RouteConfigLoadEnd";
      EventType2[EventType2["ChildActivationStart"] = 11] = "ChildActivationStart";
      EventType2[EventType2["ChildActivationEnd"] = 12] = "ChildActivationEnd";
      EventType2[EventType2["ActivationStart"] = 13] = "ActivationStart";
      EventType2[EventType2["ActivationEnd"] = 14] = "ActivationEnd";
      EventType2[EventType2["Scroll"] = 15] = "Scroll";
      EventType2[EventType2["NavigationSkipped"] = 16] = "NavigationSkipped";
    })(EventType || (EventType = {}));
    RouterEvent = class {
      id;
      url;
      constructor(id, url) {
        this.id = id;
        this.url = url;
      }
    };
    NavigationStart = class extends RouterEvent {
      type = EventType.NavigationStart;
      /**
       * Identifies the call or event that triggered the navigation.
       * An `imperative` trigger is a call to `router.navigateByUrl()` or `router.navigate()`.
       *
       * @see {@link NavigationEnd}
       * @see {@link NavigationCancel}
       * @see {@link NavigationError}
       */
      navigationTrigger;
      /**
       * The navigation state that was previously supplied to the `pushState` call,
       * when the navigation is triggered by a `popstate` event. Otherwise null.
       *
       * The state object is defined by `NavigationExtras`, and contains any
       * developer-defined state value, as well as a unique ID that
       * the router assigns to every router transition/navigation.
       *
       * From the perspective of the router, the router never "goes back".
       * When the user clicks on the back button in the browser,
       * a new navigation ID is created.
       *
       * Use the ID in this previous-state object to differentiate between a newly created
       * state and one returned to by a `popstate` event, so that you can restore some
       * remembered state, such as scroll position.
       *
       */
      restoredState;
      constructor(id, url, navigationTrigger = "imperative", restoredState = null) {
        super(id, url);
        this.navigationTrigger = navigationTrigger;
        this.restoredState = restoredState;
      }
      /** @docsNotRequired */
      toString() {
        return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
      }
    };
    NavigationEnd = class extends RouterEvent {
      urlAfterRedirects;
      type = EventType.NavigationEnd;
      constructor(id, url, urlAfterRedirects) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
      }
      /** @docsNotRequired */
      toString() {
        return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
      }
    };
    (function(NavigationCancellationCode2) {
      NavigationCancellationCode2[NavigationCancellationCode2["Redirect"] = 0] = "Redirect";
      NavigationCancellationCode2[NavigationCancellationCode2["SupersededByNewNavigation"] = 1] = "SupersededByNewNavigation";
      NavigationCancellationCode2[NavigationCancellationCode2["NoDataFromResolver"] = 2] = "NoDataFromResolver";
      NavigationCancellationCode2[NavigationCancellationCode2["GuardRejected"] = 3] = "GuardRejected";
    })(NavigationCancellationCode || (NavigationCancellationCode = {}));
    (function(NavigationSkippedCode2) {
      NavigationSkippedCode2[NavigationSkippedCode2["IgnoredSameUrlNavigation"] = 0] = "IgnoredSameUrlNavigation";
      NavigationSkippedCode2[NavigationSkippedCode2["IgnoredByUrlHandlingStrategy"] = 1] = "IgnoredByUrlHandlingStrategy";
    })(NavigationSkippedCode || (NavigationSkippedCode = {}));
    NavigationCancel = class extends RouterEvent {
      reason;
      code;
      type = EventType.NavigationCancel;
      constructor(id, url, reason, code) {
        super(id, url);
        this.reason = reason;
        this.code = code;
      }
      /** @docsNotRequired */
      toString() {
        return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
      }
    };
    NavigationSkipped = class extends RouterEvent {
      reason;
      code;
      type = EventType.NavigationSkipped;
      constructor(id, url, reason, code) {
        super(id, url);
        this.reason = reason;
        this.code = code;
      }
    };
    NavigationError = class extends RouterEvent {
      error;
      target;
      type = EventType.NavigationError;
      constructor(id, url, error, target) {
        super(id, url);
        this.error = error;
        this.target = target;
      }
      /** @docsNotRequired */
      toString() {
        return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
      }
    };
    RoutesRecognized = class extends RouterEvent {
      urlAfterRedirects;
      state;
      type = EventType.RoutesRecognized;
      constructor(id, url, urlAfterRedirects, state2) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state2;
      }
      /** @docsNotRequired */
      toString() {
        return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
      }
    };
    GuardsCheckStart = class extends RouterEvent {
      urlAfterRedirects;
      state;
      type = EventType.GuardsCheckStart;
      constructor(id, url, urlAfterRedirects, state2) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state2;
      }
      toString() {
        return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
      }
    };
    GuardsCheckEnd = class extends RouterEvent {
      urlAfterRedirects;
      state;
      shouldActivate;
      type = EventType.GuardsCheckEnd;
      constructor(id, url, urlAfterRedirects, state2, shouldActivate) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state2;
        this.shouldActivate = shouldActivate;
      }
      toString() {
        return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
      }
    };
    ResolveStart = class extends RouterEvent {
      urlAfterRedirects;
      state;
      type = EventType.ResolveStart;
      constructor(id, url, urlAfterRedirects, state2) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state2;
      }
      toString() {
        return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
      }
    };
    ResolveEnd = class extends RouterEvent {
      urlAfterRedirects;
      state;
      type = EventType.ResolveEnd;
      constructor(id, url, urlAfterRedirects, state2) {
        super(id, url);
        this.urlAfterRedirects = urlAfterRedirects;
        this.state = state2;
      }
      toString() {
        return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
      }
    };
    RouteConfigLoadStart = class {
      route;
      type = EventType.RouteConfigLoadStart;
      constructor(route) {
        this.route = route;
      }
      toString() {
        return `RouteConfigLoadStart(path: ${this.route.path})`;
      }
    };
    RouteConfigLoadEnd = class {
      route;
      type = EventType.RouteConfigLoadEnd;
      constructor(route) {
        this.route = route;
      }
      toString() {
        return `RouteConfigLoadEnd(path: ${this.route.path})`;
      }
    };
    ChildActivationStart = class {
      snapshot;
      type = EventType.ChildActivationStart;
      constructor(snapshot) {
        this.snapshot = snapshot;
      }
      toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || "";
        return `ChildActivationStart(path: '${path}')`;
      }
    };
    ChildActivationEnd = class {
      snapshot;
      type = EventType.ChildActivationEnd;
      constructor(snapshot) {
        this.snapshot = snapshot;
      }
      toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || "";
        return `ChildActivationEnd(path: '${path}')`;
      }
    };
    ActivationStart = class {
      snapshot;
      type = EventType.ActivationStart;
      constructor(snapshot) {
        this.snapshot = snapshot;
      }
      toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || "";
        return `ActivationStart(path: '${path}')`;
      }
    };
    ActivationEnd = class {
      snapshot;
      type = EventType.ActivationEnd;
      constructor(snapshot) {
        this.snapshot = snapshot;
      }
      toString() {
        const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || "";
        return `ActivationEnd(path: '${path}')`;
      }
    };
    BeforeActivateRoutes = class {
    };
    RedirectRequest = class {
      url;
      navigationBehaviorOptions;
      constructor(url, navigationBehaviorOptions) {
        this.url = url;
        this.navigationBehaviorOptions = navigationBehaviorOptions;
      }
    };
    OutletContext = class {
      rootInjector;
      outlet = null;
      route = null;
      children;
      attachRef = null;
      get injector() {
        return getClosestRouteInjector(this.route?.snapshot) ?? this.rootInjector;
      }
      constructor(rootInjector) {
        this.rootInjector = rootInjector;
        this.children = new ChildrenOutletContexts(this.rootInjector);
      }
    };
    ChildrenOutletContexts = class _ChildrenOutletContexts {
      rootInjector;
      // contexts for child outlets, by name.
      contexts = /* @__PURE__ */ new Map();
      /** @docs-private */
      constructor(rootInjector) {
        this.rootInjector = rootInjector;
      }
      /** Called when a `RouterOutlet` directive is instantiated */
      onChildOutletCreated(childName, outlet) {
        const context = this.getOrCreateContext(childName);
        context.outlet = outlet;
        this.contexts.set(childName, context);
      }
      /**
       * Called when a `RouterOutlet` directive is destroyed.
       * We need to keep the context as the outlet could be destroyed inside a NgIf and might be
       * re-created later.
       */
      onChildOutletDestroyed(childName) {
        const context = this.getContext(childName);
        if (context) {
          context.outlet = null;
          context.attachRef = null;
        }
      }
      /**
       * Called when the corresponding route is deactivated during navigation.
       * Because the component get destroyed, all children outlet are destroyed.
       */
      onOutletDeactivated() {
        const contexts = this.contexts;
        this.contexts = /* @__PURE__ */ new Map();
        return contexts;
      }
      onOutletReAttached(contexts) {
        this.contexts = contexts;
      }
      getOrCreateContext(childName) {
        let context = this.getContext(childName);
        if (!context) {
          context = new OutletContext(this.rootInjector);
          this.contexts.set(childName, context);
        }
        return context;
      }
      getContext(childName) {
        return this.contexts.get(childName) || null;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _ChildrenOutletContexts,
        deps: [{
          token: EnvironmentInjector
        }],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _ChildrenOutletContexts,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: ChildrenOutletContexts,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }],
      ctorParameters: () => [{
        type: EnvironmentInjector
      }]
    });
    Tree = class {
      /** @internal */
      _root;
      constructor(root) {
        this._root = root;
      }
      get root() {
        return this._root.value;
      }
      /**
       * @internal
       */
      parent(t) {
        const p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
      }
      /**
       * @internal
       */
      children(t) {
        const n = findNode(t, this._root);
        return n ? n.children.map((t2) => t2.value) : [];
      }
      /**
       * @internal
       */
      firstChild(t) {
        const n = findNode(t, this._root);
        return n && n.children.length > 0 ? n.children[0].value : null;
      }
      /**
       * @internal
       */
      siblings(t) {
        const p = findPath(t, this._root);
        if (p.length < 2) return [];
        const c = p[p.length - 2].children.map((c2) => c2.value);
        return c.filter((cc) => cc !== t);
      }
      /**
       * @internal
       */
      pathFromRoot(t) {
        return findPath(t, this._root).map((s) => s.value);
      }
    };
    TreeNode = class {
      value;
      children;
      constructor(value, children) {
        this.value = value;
        this.children = children;
      }
      toString() {
        return `TreeNode(${this.value})`;
      }
    };
    RouterState = class extends Tree {
      snapshot;
      /** @internal */
      constructor(root, snapshot) {
        super(root);
        this.snapshot = snapshot;
        setRouterState(this, root);
      }
      toString() {
        return this.snapshot.toString();
      }
    };
    ActivatedRoute = class {
      urlSubject;
      paramsSubject;
      queryParamsSubject;
      fragmentSubject;
      dataSubject;
      outlet;
      component;
      /** The current snapshot of this route */
      snapshot;
      /** @internal */
      _futureSnapshot;
      /** @internal */
      _routerState;
      /** @internal */
      _paramMap;
      /** @internal */
      _queryParamMap;
      /** An Observable of the resolved route title */
      title;
      /** An observable of the URL segments matched by this route. */
      url;
      /** An observable of the matrix parameters scoped to this route. */
      params;
      /** An observable of the query parameters shared by all the routes. */
      queryParams;
      /** An observable of the URL fragment shared by all the routes. */
      fragment;
      /** An observable of the static and resolved data of this route. */
      data;
      /** @internal */
      constructor(urlSubject, paramsSubject, queryParamsSubject, fragmentSubject, dataSubject, outlet, component, futureSnapshot) {
        this.urlSubject = urlSubject;
        this.paramsSubject = paramsSubject;
        this.queryParamsSubject = queryParamsSubject;
        this.fragmentSubject = fragmentSubject;
        this.dataSubject = dataSubject;
        this.outlet = outlet;
        this.component = component;
        this._futureSnapshot = futureSnapshot;
        this.title = this.dataSubject?.pipe(map((d) => d[RouteTitleKey])) ?? of(void 0);
        this.url = urlSubject;
        this.params = paramsSubject;
        this.queryParams = queryParamsSubject;
        this.fragment = fragmentSubject;
        this.data = dataSubject;
      }
      /** The configuration used to match this route. */
      get routeConfig() {
        return this._futureSnapshot.routeConfig;
      }
      /** The root of the router state. */
      get root() {
        return this._routerState.root;
      }
      /** The parent of this route in the router state tree. */
      get parent() {
        return this._routerState.parent(this);
      }
      /** The first child of this route in the router state tree. */
      get firstChild() {
        return this._routerState.firstChild(this);
      }
      /** The children of this route in the router state tree. */
      get children() {
        return this._routerState.children(this);
      }
      /** The path from the root of the router state tree to this route. */
      get pathFromRoot() {
        return this._routerState.pathFromRoot(this);
      }
      /**
       * An Observable that contains a map of the required and optional parameters
       * specific to the route.
       * The map supports retrieving single and multiple values from the same parameter.
       */
      get paramMap() {
        this._paramMap ??= this.params.pipe(map((p) => convertToParamMap(p)));
        return this._paramMap;
      }
      /**
       * An Observable that contains a map of the query parameters available to all routes.
       * The map supports retrieving single and multiple values from the query parameter.
       */
      get queryParamMap() {
        this._queryParamMap ??= this.queryParams.pipe(map((p) => convertToParamMap(p)));
        return this._queryParamMap;
      }
      toString() {
        return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
      }
    };
    ActivatedRouteSnapshot = class {
      url;
      params;
      queryParams;
      fragment;
      data;
      outlet;
      component;
      /** The configuration used to match this route **/
      routeConfig;
      /** @internal */
      _resolve;
      /** @internal */
      _resolvedData;
      /** @internal */
      _routerState;
      /** @internal */
      _paramMap;
      /** @internal */
      _queryParamMap;
      /** The resolved route title */
      get title() {
        return this.data?.[RouteTitleKey];
      }
      /** @internal */
      constructor(url, params, queryParams, fragment, data, outlet, component, routeConfig, resolve2) {
        this.url = url;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.outlet = outlet;
        this.component = component;
        this.routeConfig = routeConfig;
        this._resolve = resolve2;
      }
      /** The root of the router state */
      get root() {
        return this._routerState.root;
      }
      /** The parent of this route in the router state tree */
      get parent() {
        return this._routerState.parent(this);
      }
      /** The first child of this route in the router state tree */
      get firstChild() {
        return this._routerState.firstChild(this);
      }
      /** The children of this route in the router state tree */
      get children() {
        return this._routerState.children(this);
      }
      /** The path from the root of the router state tree to this route */
      get pathFromRoot() {
        return this._routerState.pathFromRoot(this);
      }
      get paramMap() {
        this._paramMap ??= convertToParamMap(this.params);
        return this._paramMap;
      }
      get queryParamMap() {
        this._queryParamMap ??= convertToParamMap(this.queryParams);
        return this._queryParamMap;
      }
      toString() {
        const url = this.url.map((segment) => segment.toString()).join("/");
        const matched = this.routeConfig ? this.routeConfig.path : "";
        return `Route(url:'${url}', path:'${matched}')`;
      }
    };
    RouterStateSnapshot = class extends Tree {
      url;
      /** @internal */
      constructor(url, root) {
        super(root);
        this.url = url;
        setRouterState(this, root);
      }
      toString() {
        return serializeNode(this._root);
      }
    };
    ROUTER_OUTLET_DATA = new InjectionToken(ngDevMode ? "RouterOutlet data" : "");
    RouterOutlet = class _RouterOutlet {
      activated = null;
      /** @internal */
      get activatedComponentRef() {
        return this.activated;
      }
      _activatedRoute = null;
      /**
       * The name of the outlet
       *
       */
      name = PRIMARY_OUTLET;
      activateEvents = new EventEmitter();
      deactivateEvents = new EventEmitter();
      /**
       * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
       * previously detached subtree.
       **/
      attachEvents = new EventEmitter();
      /**
       * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
       * subtree.
       */
      detachEvents = new EventEmitter();
      /**
       * Data that will be provided to the child injector through the `ROUTER_OUTLET_DATA` token.
       *
       * When unset, the value of the token is `undefined` by default.
       */
      routerOutletData = input(void 0);
      parentContexts = inject(ChildrenOutletContexts);
      location = inject(ViewContainerRef);
      changeDetector = inject(ChangeDetectorRef);
      inputBinder = inject(INPUT_BINDER, {
        optional: true
      });
      /** @docs-private */
      supportsBindingToComponentInputs = true;
      /** @docs-private */
      ngOnChanges(changes) {
        if (changes["name"]) {
          const {
            firstChange,
            previousValue
          } = changes["name"];
          if (firstChange) {
            return;
          }
          if (this.isTrackedInParentContexts(previousValue)) {
            this.deactivate();
            this.parentContexts.onChildOutletDestroyed(previousValue);
          }
          this.initializeOutletWithName();
        }
      }
      /** @docs-private */
      ngOnDestroy() {
        if (this.isTrackedInParentContexts(this.name)) {
          this.parentContexts.onChildOutletDestroyed(this.name);
        }
        this.inputBinder?.unsubscribeFromRouteData(this);
      }
      isTrackedInParentContexts(outletName) {
        return this.parentContexts.getContext(outletName)?.outlet === this;
      }
      /** @docs-private */
      ngOnInit() {
        this.initializeOutletWithName();
      }
      initializeOutletWithName() {
        this.parentContexts.onChildOutletCreated(this.name, this);
        if (this.activated) {
          return;
        }
        const context = this.parentContexts.getContext(this.name);
        if (context?.route) {
          if (context.attachRef) {
            this.attach(context.attachRef, context.route);
          } else {
            this.activateWith(context.route, context.injector);
          }
        }
      }
      get isActivated() {
        return !!this.activated;
      }
      /**
       * @returns The currently activated component instance.
       * @throws An error if the outlet is not activated.
       */
      get component() {
        if (!this.activated) throw new RuntimeError(4012, (typeof ngDevMode === "undefined" || ngDevMode) && "Outlet is not activated");
        return this.activated.instance;
      }
      get activatedRoute() {
        if (!this.activated) throw new RuntimeError(4012, (typeof ngDevMode === "undefined" || ngDevMode) && "Outlet is not activated");
        return this._activatedRoute;
      }
      get activatedRouteData() {
        if (this._activatedRoute) {
          return this._activatedRoute.snapshot.data;
        }
        return {};
      }
      /**
       * Called when the `RouteReuseStrategy` instructs to detach the subtree
       */
      detach() {
        if (!this.activated) throw new RuntimeError(4012, (typeof ngDevMode === "undefined" || ngDevMode) && "Outlet is not activated");
        this.location.detach();
        const cmp = this.activated;
        this.activated = null;
        this._activatedRoute = null;
        this.detachEvents.emit(cmp.instance);
        return cmp;
      }
      /**
       * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
       */
      attach(ref, activatedRoute) {
        this.activated = ref;
        this._activatedRoute = activatedRoute;
        this.location.insert(ref.hostView);
        this.inputBinder?.bindActivatedRouteToOutletComponent(this);
        this.attachEvents.emit(ref.instance);
      }
      deactivate() {
        if (this.activated) {
          const c = this.component;
          this.activated.destroy();
          this.activated = null;
          this._activatedRoute = null;
          this.deactivateEvents.emit(c);
        }
      }
      activateWith(activatedRoute, environmentInjector) {
        if (this.isActivated) {
          throw new RuntimeError(4013, (typeof ngDevMode === "undefined" || ngDevMode) && "Cannot activate an already activated outlet");
        }
        this._activatedRoute = activatedRoute;
        const location = this.location;
        const snapshot = activatedRoute.snapshot;
        const component = snapshot.component;
        const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
        const injector = new OutletInjector(activatedRoute, childContexts, location.injector, this.routerOutletData);
        this.activated = location.createComponent(component, {
          index: location.length,
          injector,
          environmentInjector
        });
        this.changeDetector.markForCheck();
        this.inputBinder?.bindActivatedRouteToOutletComponent(this);
        this.activateEvents.emit(this.activated.instance);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RouterOutlet,
        deps: [],
        target: FactoryTarget.Directive
      });
      static \u0275dir = \u0275\u0275ngDeclareDirective({
        minVersion: "17.1.0",
        version: "19.2.14",
        type: _RouterOutlet,
        isStandalone: true,
        selector: "router-outlet",
        inputs: {
          name: {
            classPropertyName: "name",
            publicName: "name",
            isSignal: false,
            isRequired: false,
            transformFunction: null
          },
          routerOutletData: {
            classPropertyName: "routerOutletData",
            publicName: "routerOutletData",
            isSignal: true,
            isRequired: false,
            transformFunction: null
          }
        },
        outputs: {
          activateEvents: "activate",
          deactivateEvents: "deactivate",
          attachEvents: "attach",
          detachEvents: "detach"
        },
        exportAs: ["outlet"],
        usesOnChanges: true,
        ngImport: core_exports
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: RouterOutlet,
      decorators: [{
        type: Directive,
        args: [{
          selector: "router-outlet",
          exportAs: "outlet"
        }]
      }],
      propDecorators: {
        name: [{
          type: Input
        }],
        activateEvents: [{
          type: Output,
          args: ["activate"]
        }],
        deactivateEvents: [{
          type: Output,
          args: ["deactivate"]
        }],
        attachEvents: [{
          type: Output,
          args: ["attach"]
        }],
        detachEvents: [{
          type: Output,
          args: ["detach"]
        }]
      }
    });
    OutletInjector = class {
      route;
      childContexts;
      parent;
      outletData;
      constructor(route, childContexts, parent, outletData) {
        this.route = route;
        this.childContexts = childContexts;
        this.parent = parent;
        this.outletData = outletData;
      }
      get(token, notFoundValue) {
        if (token === ActivatedRoute) {
          return this.route;
        }
        if (token === ChildrenOutletContexts) {
          return this.childContexts;
        }
        if (token === ROUTER_OUTLET_DATA) {
          return this.outletData;
        }
        return this.parent.get(token, notFoundValue);
      }
    };
    INPUT_BINDER = new InjectionToken("");
    RoutedComponentInputBinder = class _RoutedComponentInputBinder {
      outletDataSubscriptions = /* @__PURE__ */ new Map();
      bindActivatedRouteToOutletComponent(outlet) {
        this.unsubscribeFromRouteData(outlet);
        this.subscribeToRouteData(outlet);
      }
      unsubscribeFromRouteData(outlet) {
        this.outletDataSubscriptions.get(outlet)?.unsubscribe();
        this.outletDataSubscriptions.delete(outlet);
      }
      subscribeToRouteData(outlet) {
        const {
          activatedRoute
        } = outlet;
        const dataSubscription = combineLatest([activatedRoute.queryParams, activatedRoute.params, activatedRoute.data]).pipe(switchMap(([queryParams, params, data], index) => {
          data = __spreadValues(__spreadValues(__spreadValues({}, queryParams), params), data);
          if (index === 0) {
            return of(data);
          }
          return Promise.resolve(data);
        })).subscribe((data) => {
          if (!outlet.isActivated || !outlet.activatedComponentRef || outlet.activatedRoute !== activatedRoute || activatedRoute.component === null) {
            this.unsubscribeFromRouteData(outlet);
            return;
          }
          const mirror = reflectComponentType(activatedRoute.component);
          if (!mirror) {
            this.unsubscribeFromRouteData(outlet);
            return;
          }
          for (const {
            templateName
          } of mirror.inputs) {
            outlet.activatedComponentRef.setInput(templateName, data[templateName]);
          }
        });
        this.outletDataSubscriptions.set(outlet, dataSubscription);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RoutedComponentInputBinder,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RoutedComponentInputBinder
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: RoutedComponentInputBinder,
      decorators: [{
        type: Injectable
      }]
    });
    \u0275EmptyOutletComponent = class _\u0275EmptyOutletComponent {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _\u0275EmptyOutletComponent,
        deps: [],
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.14",
        type: _\u0275EmptyOutletComponent,
        isStandalone: true,
        selector: "ng-component",
        exportAs: ["emptyRouterOutlet"],
        ngImport: core_exports,
        template: `<router-outlet/>`,
        isInline: true,
        dependencies: [{
          kind: "directive",
          type: RouterOutlet,
          selector: "router-outlet",
          inputs: ["name", "routerOutletData"],
          outputs: ["activate", "deactivate", "attach", "detach"],
          exportAs: ["outlet"]
        }]
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: \u0275EmptyOutletComponent,
      decorators: [{
        type: Component,
        args: [{
          template: `<router-outlet/>`,
          imports: [RouterOutlet],
          // Used to avoid component ID collisions with user code.
          exportAs: "emptyRouterOutlet"
        }]
      }]
    });
    RedirectCommand = class {
      redirectTo;
      navigationBehaviorOptions;
      constructor(redirectTo, navigationBehaviorOptions) {
        this.redirectTo = redirectTo;
        this.navigationBehaviorOptions = navigationBehaviorOptions;
      }
    };
    NAVIGATION_CANCELING_ERROR = "ngNavigationCancelingError";
    warnedAboutUnsupportedInputBinding = false;
    activateRoutes = (rootContexts, routeReuseStrategy, forwardEvent, inputBindingEnabled) => map((t) => {
      new ActivateRoutes(routeReuseStrategy, t.targetRouterState, t.currentRouterState, forwardEvent, inputBindingEnabled).activate(rootContexts);
      return t;
    });
    ActivateRoutes = class {
      routeReuseStrategy;
      futureState;
      currState;
      forwardEvent;
      inputBindingEnabled;
      constructor(routeReuseStrategy, futureState, currState, forwardEvent, inputBindingEnabled) {
        this.routeReuseStrategy = routeReuseStrategy;
        this.futureState = futureState;
        this.currState = currState;
        this.forwardEvent = forwardEvent;
        this.inputBindingEnabled = inputBindingEnabled;
      }
      activate(parentContexts) {
        const futureRoot = this.futureState._root;
        const currRoot = this.currState ? this.currState._root : null;
        this.deactivateChildRoutes(futureRoot, currRoot, parentContexts);
        advanceActivatedRoute(this.futureState.root);
        this.activateChildRoutes(futureRoot, currRoot, parentContexts);
      }
      // De-activate the child route that are not re-used for the future state
      deactivateChildRoutes(futureNode, currNode, contexts) {
        const children = nodeChildrenAsMap(currNode);
        futureNode.children.forEach((futureChild) => {
          const childOutletName = futureChild.value.outlet;
          this.deactivateRoutes(futureChild, children[childOutletName], contexts);
          delete children[childOutletName];
        });
        Object.values(children).forEach((v) => {
          this.deactivateRouteAndItsChildren(v, contexts);
        });
      }
      deactivateRoutes(futureNode, currNode, parentContext) {
        const future = futureNode.value;
        const curr = currNode ? currNode.value : null;
        if (future === curr) {
          if (future.component) {
            const context = parentContext.getContext(future.outlet);
            if (context) {
              this.deactivateChildRoutes(futureNode, currNode, context.children);
            }
          } else {
            this.deactivateChildRoutes(futureNode, currNode, parentContext);
          }
        } else {
          if (curr) {
            this.deactivateRouteAndItsChildren(currNode, parentContext);
          }
        }
      }
      deactivateRouteAndItsChildren(route, parentContexts) {
        if (route.value.component && this.routeReuseStrategy.shouldDetach(route.value.snapshot)) {
          this.detachAndStoreRouteSubtree(route, parentContexts);
        } else {
          this.deactivateRouteAndOutlet(route, parentContexts);
        }
      }
      detachAndStoreRouteSubtree(route, parentContexts) {
        const context = parentContexts.getContext(route.value.outlet);
        const contexts = context && route.value.component ? context.children : parentContexts;
        const children = nodeChildrenAsMap(route);
        for (const treeNode of Object.values(children)) {
          this.deactivateRouteAndItsChildren(treeNode, contexts);
        }
        if (context && context.outlet) {
          const componentRef = context.outlet.detach();
          const contexts2 = context.children.onOutletDeactivated();
          this.routeReuseStrategy.store(route.value.snapshot, {
            componentRef,
            route,
            contexts: contexts2
          });
        }
      }
      deactivateRouteAndOutlet(route, parentContexts) {
        const context = parentContexts.getContext(route.value.outlet);
        const contexts = context && route.value.component ? context.children : parentContexts;
        const children = nodeChildrenAsMap(route);
        for (const treeNode of Object.values(children)) {
          this.deactivateRouteAndItsChildren(treeNode, contexts);
        }
        if (context) {
          if (context.outlet) {
            context.outlet.deactivate();
            context.children.onOutletDeactivated();
          }
          context.attachRef = null;
          context.route = null;
        }
      }
      activateChildRoutes(futureNode, currNode, contexts) {
        const children = nodeChildrenAsMap(currNode);
        futureNode.children.forEach((c) => {
          this.activateRoutes(c, children[c.value.outlet], contexts);
          this.forwardEvent(new ActivationEnd(c.value.snapshot));
        });
        if (futureNode.children.length) {
          this.forwardEvent(new ChildActivationEnd(futureNode.value.snapshot));
        }
      }
      activateRoutes(futureNode, currNode, parentContexts) {
        const future = futureNode.value;
        const curr = currNode ? currNode.value : null;
        advanceActivatedRoute(future);
        if (future === curr) {
          if (future.component) {
            const context = parentContexts.getOrCreateContext(future.outlet);
            this.activateChildRoutes(futureNode, currNode, context.children);
          } else {
            this.activateChildRoutes(futureNode, currNode, parentContexts);
          }
        } else {
          if (future.component) {
            const context = parentContexts.getOrCreateContext(future.outlet);
            if (this.routeReuseStrategy.shouldAttach(future.snapshot)) {
              const stored = this.routeReuseStrategy.retrieve(future.snapshot);
              this.routeReuseStrategy.store(future.snapshot, null);
              context.children.onOutletReAttached(stored.contexts);
              context.attachRef = stored.componentRef;
              context.route = stored.route.value;
              if (context.outlet) {
                context.outlet.attach(stored.componentRef, stored.route.value);
              }
              advanceActivatedRoute(stored.route.value);
              this.activateChildRoutes(futureNode, null, context.children);
            } else {
              context.attachRef = null;
              context.route = future;
              if (context.outlet) {
                context.outlet.activateWith(future, context.injector);
              }
              this.activateChildRoutes(futureNode, null, context.children);
            }
          } else {
            this.activateChildRoutes(futureNode, null, parentContexts);
          }
        }
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          const context = parentContexts.getOrCreateContext(future.outlet);
          const outlet = context.outlet;
          if (outlet && this.inputBindingEnabled && !outlet.supportsBindingToComponentInputs && !warnedAboutUnsupportedInputBinding) {
            console.warn(`'withComponentInputBinding' feature is enabled but this application is using an outlet that may not support binding to component inputs.`);
            warnedAboutUnsupportedInputBinding = true;
          }
        }
      }
    };
    CanActivate = class {
      path;
      route;
      constructor(path) {
        this.path = path;
        this.route = this.path[this.path.length - 1];
      }
    };
    CanDeactivate = class {
      component;
      route;
      constructor(component, route) {
        this.component = component;
        this.route = route;
      }
    };
    INITIAL_VALUE = /* @__PURE__ */ Symbol("INITIAL_VALUE");
    NoMatch = class {
      segmentGroup;
      constructor(segmentGroup) {
        this.segmentGroup = segmentGroup || null;
      }
    };
    AbsoluteRedirect = class extends Error {
      urlTree;
      constructor(urlTree) {
        super();
        this.urlTree = urlTree;
      }
    };
    ApplyRedirects = class {
      urlSerializer;
      urlTree;
      constructor(urlSerializer, urlTree) {
        this.urlSerializer = urlSerializer;
        this.urlTree = urlTree;
      }
      lineralizeSegments(route, urlTree) {
        let res = [];
        let c = urlTree.root;
        while (true) {
          res = res.concat(c.segments);
          if (c.numberOfChildren === 0) {
            return of(res);
          }
          if (c.numberOfChildren > 1 || !c.children[PRIMARY_OUTLET]) {
            return namedOutletsRedirect(`${route.redirectTo}`);
          }
          c = c.children[PRIMARY_OUTLET];
        }
      }
      applyRedirectCommands(segments, redirectTo, posParams, currentSnapshot, injector) {
        if (typeof redirectTo !== "string") {
          const redirectToFn = redirectTo;
          const {
            queryParams,
            fragment,
            routeConfig,
            url,
            outlet,
            params,
            data,
            title
          } = currentSnapshot;
          const newRedirect = runInInjectionContext(injector, () => redirectToFn({
            params,
            data,
            queryParams,
            fragment,
            routeConfig,
            url,
            outlet,
            title
          }));
          if (newRedirect instanceof UrlTree) {
            throw new AbsoluteRedirect(newRedirect);
          }
          redirectTo = newRedirect;
        }
        const newTree = this.applyRedirectCreateUrlTree(redirectTo, this.urlSerializer.parse(redirectTo), segments, posParams);
        if (redirectTo[0] === "/") {
          throw new AbsoluteRedirect(newTree);
        }
        return newTree;
      }
      applyRedirectCreateUrlTree(redirectTo, urlTree, segments, posParams) {
        const newRoot = this.createSegmentGroup(redirectTo, urlTree.root, segments, posParams);
        return new UrlTree(newRoot, this.createQueryParams(urlTree.queryParams, this.urlTree.queryParams), urlTree.fragment);
      }
      createQueryParams(redirectToParams, actualParams) {
        const res = {};
        Object.entries(redirectToParams).forEach(([k, v]) => {
          const copySourceValue = typeof v === "string" && v[0] === ":";
          if (copySourceValue) {
            const sourceName = v.substring(1);
            res[k] = actualParams[sourceName];
          } else {
            res[k] = v;
          }
        });
        return res;
      }
      createSegmentGroup(redirectTo, group2, segments, posParams) {
        const updatedSegments = this.createSegments(redirectTo, group2.segments, segments, posParams);
        let children = {};
        Object.entries(group2.children).forEach(([name, child]) => {
          children[name] = this.createSegmentGroup(redirectTo, child, segments, posParams);
        });
        return new UrlSegmentGroup(updatedSegments, children);
      }
      createSegments(redirectTo, redirectToSegments, actualSegments, posParams) {
        return redirectToSegments.map((s) => s.path[0] === ":" ? this.findPosParam(redirectTo, s, posParams) : this.findOrReturn(s, actualSegments));
      }
      findPosParam(redirectTo, redirectToUrlSegment, posParams) {
        const pos = posParams[redirectToUrlSegment.path.substring(1)];
        if (!pos) throw new RuntimeError(4001, (typeof ngDevMode === "undefined" || ngDevMode) && `Cannot redirect to '${redirectTo}'. Cannot find '${redirectToUrlSegment.path}'.`);
        return pos;
      }
      findOrReturn(redirectToUrlSegment, actualSegments) {
        let idx = 0;
        for (const s of actualSegments) {
          if (s.path === redirectToUrlSegment.path) {
            actualSegments.splice(idx);
            return s;
          }
          idx++;
        }
        return redirectToUrlSegment;
      }
    };
    noMatch = {
      matched: false,
      consumedSegments: [],
      remainingSegments: [],
      parameters: {},
      positionalParamSegments: {}
    };
    NoLeftoversInUrl = class {
    };
    MAX_ALLOWED_REDIRECTS = 31;
    Recognizer = class {
      injector;
      configLoader;
      rootComponentType;
      config;
      urlTree;
      paramsInheritanceStrategy;
      urlSerializer;
      applyRedirects;
      absoluteRedirectCount = 0;
      allowRedirects = true;
      constructor(injector, configLoader, rootComponentType, config, urlTree, paramsInheritanceStrategy, urlSerializer) {
        this.injector = injector;
        this.configLoader = configLoader;
        this.rootComponentType = rootComponentType;
        this.config = config;
        this.urlTree = urlTree;
        this.paramsInheritanceStrategy = paramsInheritanceStrategy;
        this.urlSerializer = urlSerializer;
        this.applyRedirects = new ApplyRedirects(this.urlSerializer, this.urlTree);
      }
      noMatchError(e) {
        return new RuntimeError(4002, typeof ngDevMode === "undefined" || ngDevMode ? `Cannot match any routes. URL Segment: '${e.segmentGroup}'` : `'${e.segmentGroup}'`);
      }
      recognize() {
        const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;
        return this.match(rootSegmentGroup).pipe(map(({
          children,
          rootSnapshot
        }) => {
          const rootNode = new TreeNode(rootSnapshot, children);
          const routeState = new RouterStateSnapshot("", rootNode);
          const tree2 = createUrlTreeFromSnapshot(rootSnapshot, [], this.urlTree.queryParams, this.urlTree.fragment);
          tree2.queryParams = this.urlTree.queryParams;
          routeState.url = this.urlSerializer.serialize(tree2);
          return {
            state: routeState,
            tree: tree2
          };
        }));
      }
      match(rootSegmentGroup) {
        const rootSnapshot = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze(__spreadValues({}, this.urlTree.queryParams)), this.urlTree.fragment, Object.freeze({}), PRIMARY_OUTLET, this.rootComponentType, null, {});
        return this.processSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET, rootSnapshot).pipe(map((children) => {
          return {
            children,
            rootSnapshot
          };
        }), catchError((e) => {
          if (e instanceof AbsoluteRedirect) {
            this.urlTree = e.urlTree;
            return this.match(e.urlTree.root);
          }
          if (e instanceof NoMatch) {
            throw this.noMatchError(e);
          }
          throw e;
        }));
      }
      processSegmentGroup(injector, config, segmentGroup, outlet, parentRoute) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
          return this.processChildren(injector, config, segmentGroup, parentRoute);
        }
        return this.processSegment(injector, config, segmentGroup, segmentGroup.segments, outlet, true, parentRoute).pipe(map((child) => child instanceof TreeNode ? [child] : []));
      }
      /**
       * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
       * we cannot find a match for _any_ of the children.
       *
       * @param config - The `Routes` to match against
       * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
       *     config.
       */
      processChildren(injector, config, segmentGroup, parentRoute) {
        const childOutlets = [];
        for (const child of Object.keys(segmentGroup.children)) {
          if (child === "primary") {
            childOutlets.unshift(child);
          } else {
            childOutlets.push(child);
          }
        }
        return from(childOutlets).pipe(concatMap((childOutlet) => {
          const child = segmentGroup.children[childOutlet];
          const sortedConfig = sortByMatchingOutlets(config, childOutlet);
          return this.processSegmentGroup(injector, sortedConfig, child, childOutlet, parentRoute);
        }), scan((children, outletChildren) => {
          children.push(...outletChildren);
          return children;
        }), defaultIfEmpty(null), last(), mergeMap((children) => {
          if (children === null) return noMatch$1(segmentGroup);
          const mergedChildren = mergeEmptyPathMatches(children);
          if (typeof ngDevMode === "undefined" || ngDevMode) {
            checkOutletNameUniqueness(mergedChildren);
          }
          sortActivatedRouteSnapshots(mergedChildren);
          return of(mergedChildren);
        }));
      }
      processSegment(injector, routes, segmentGroup, segments, outlet, allowRedirects, parentRoute) {
        return from(routes).pipe(concatMap((r) => {
          return this.processSegmentAgainstRoute(r._injector ?? injector, routes, r, segmentGroup, segments, outlet, allowRedirects, parentRoute).pipe(catchError((e) => {
            if (e instanceof NoMatch) {
              return of(null);
            }
            throw e;
          }));
        }), first((x) => !!x), catchError((e) => {
          if (isEmptyError(e)) {
            if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
              return of(new NoLeftoversInUrl());
            }
            return noMatch$1(segmentGroup);
          }
          throw e;
        }));
      }
      processSegmentAgainstRoute(injector, routes, route, rawSegment, segments, outlet, allowRedirects, parentRoute) {
        if (getOutlet(route) !== outlet && (outlet === PRIMARY_OUTLET || !emptyPathMatch(rawSegment, segments, route))) {
          return noMatch$1(rawSegment);
        }
        if (route.redirectTo === void 0) {
          return this.matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet, parentRoute);
        }
        if (this.allowRedirects && allowRedirects) {
          return this.expandSegmentAgainstRouteUsingRedirect(injector, rawSegment, routes, route, segments, outlet, parentRoute);
        }
        return noMatch$1(rawSegment);
      }
      expandSegmentAgainstRouteUsingRedirect(injector, segmentGroup, routes, route, segments, outlet, parentRoute) {
        const {
          matched,
          parameters,
          consumedSegments,
          positionalParamSegments,
          remainingSegments
        } = match(segmentGroup, route, segments);
        if (!matched) return noMatch$1(segmentGroup);
        if (typeof route.redirectTo === "string" && route.redirectTo[0] === "/") {
          this.absoluteRedirectCount++;
          if (this.absoluteRedirectCount > MAX_ALLOWED_REDIRECTS) {
            if (ngDevMode) {
              throw new RuntimeError(4016, `Detected possible infinite redirect when redirecting from '${this.urlTree}' to '${route.redirectTo}'.
This is currently a dev mode only error but will become a call stack size exceeded error in production in a future major version.`);
            }
            this.allowRedirects = false;
          }
        }
        const currentSnapshot = new ActivatedRouteSnapshot(segments, parameters, Object.freeze(__spreadValues({}, this.urlTree.queryParams)), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getResolve(route));
        const inherited = getInherited(currentSnapshot, parentRoute, this.paramsInheritanceStrategy);
        currentSnapshot.params = Object.freeze(inherited.params);
        currentSnapshot.data = Object.freeze(inherited.data);
        const newTree = this.applyRedirects.applyRedirectCommands(consumedSegments, route.redirectTo, positionalParamSegments, currentSnapshot, injector);
        return this.applyRedirects.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments) => {
          return this.processSegment(injector, routes, segmentGroup, newSegments.concat(remainingSegments), outlet, false, parentRoute);
        }));
      }
      matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet, parentRoute) {
        const matchResult = matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer);
        if (route.path === "**") {
          rawSegment.children = {};
        }
        return matchResult.pipe(switchMap((result) => {
          if (!result.matched) {
            return noMatch$1(rawSegment);
          }
          injector = route._injector ?? injector;
          return this.getChildConfig(injector, route, segments).pipe(switchMap(({
            routes: childConfig
          }) => {
            const childInjector = route._loadedInjector ?? injector;
            const {
              parameters,
              consumedSegments,
              remainingSegments
            } = result;
            const snapshot = new ActivatedRouteSnapshot(consumedSegments, parameters, Object.freeze(__spreadValues({}, this.urlTree.queryParams)), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getResolve(route));
            const inherited = getInherited(snapshot, parentRoute, this.paramsInheritanceStrategy);
            snapshot.params = Object.freeze(inherited.params);
            snapshot.data = Object.freeze(inherited.data);
            const {
              segmentGroup,
              slicedSegments
            } = split(rawSegment, consumedSegments, remainingSegments, childConfig);
            if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
              return this.processChildren(childInjector, childConfig, segmentGroup, snapshot).pipe(map((children) => {
                return new TreeNode(snapshot, children);
              }));
            }
            if (childConfig.length === 0 && slicedSegments.length === 0) {
              return of(new TreeNode(snapshot, []));
            }
            const matchedOnOutlet = getOutlet(route) === outlet;
            return this.processSegment(childInjector, childConfig, segmentGroup, slicedSegments, matchedOnOutlet ? PRIMARY_OUTLET : outlet, true, snapshot).pipe(map((child) => {
              return new TreeNode(snapshot, child instanceof TreeNode ? [child] : []);
            }));
          }));
        }));
      }
      getChildConfig(injector, route, segments) {
        if (route.children) {
          return of({
            routes: route.children,
            injector
          });
        }
        if (route.loadChildren) {
          if (route._loadedRoutes !== void 0) {
            return of({
              routes: route._loadedRoutes,
              injector: route._loadedInjector
            });
          }
          return runCanLoadGuards(injector, route, segments, this.urlSerializer).pipe(mergeMap((shouldLoadResult) => {
            if (shouldLoadResult) {
              return this.configLoader.loadChildren(injector, route).pipe(tap((cfg) => {
                route._loadedRoutes = cfg.routes;
                route._loadedInjector = cfg.injector;
              }));
            }
            return canLoadFails(route);
          }));
        }
        return of({
          routes: [],
          injector
        });
      }
    };
    TitleStrategy = class _TitleStrategy {
      /**
       * @returns The `title` of the deepest primary route.
       */
      buildTitle(snapshot) {
        let pageTitle;
        let route = snapshot.root;
        while (route !== void 0) {
          pageTitle = this.getResolvedTitleForRoute(route) ?? pageTitle;
          route = route.children.find((child) => child.outlet === PRIMARY_OUTLET);
        }
        return pageTitle;
      }
      /**
       * Given an `ActivatedRouteSnapshot`, returns the final value of the
       * `Route.title` property, which can either be a static string or a resolved value.
       */
      getResolvedTitleForRoute(snapshot) {
        return snapshot.data[RouteTitleKey];
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _TitleStrategy,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _TitleStrategy,
        providedIn: "root",
        useFactory: () => inject(DefaultTitleStrategy)
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: TitleStrategy,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root",
          useFactory: () => inject(DefaultTitleStrategy)
        }]
      }]
    });
    DefaultTitleStrategy = class _DefaultTitleStrategy extends TitleStrategy {
      title;
      constructor(title) {
        super();
        this.title = title;
      }
      /**
       * Sets the title of the browser to the given value.
       *
       * @param title The `pageTitle` from the deepest primary route.
       */
      updateTitle(snapshot) {
        const title = this.buildTitle(snapshot);
        if (title !== void 0) {
          this.title.setTitle(title);
        }
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _DefaultTitleStrategy,
        deps: [{
          token: Title
        }],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _DefaultTitleStrategy,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: DefaultTitleStrategy,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }],
      ctorParameters: () => [{
        type: Title
      }]
    });
    ROUTER_CONFIGURATION = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "router config" : "", {
      providedIn: "root",
      factory: () => ({})
    });
    ROUTES = new InjectionToken(ngDevMode ? "ROUTES" : "");
    RouterConfigLoader = class _RouterConfigLoader {
      componentLoaders = /* @__PURE__ */ new WeakMap();
      childrenLoaders = /* @__PURE__ */ new WeakMap();
      onLoadStartListener;
      onLoadEndListener;
      compiler = inject(Compiler);
      loadComponent(route) {
        if (this.componentLoaders.get(route)) {
          return this.componentLoaders.get(route);
        } else if (route._loadedComponent) {
          return of(route._loadedComponent);
        }
        if (this.onLoadStartListener) {
          this.onLoadStartListener(route);
        }
        const loadRunner = wrapIntoObservable(route.loadComponent()).pipe(map(maybeUnwrapDefaultExport), tap((component) => {
          if (this.onLoadEndListener) {
            this.onLoadEndListener(route);
          }
          (typeof ngDevMode === "undefined" || ngDevMode) && assertStandalone(route.path ?? "", component);
          route._loadedComponent = component;
        }), finalize(() => {
          this.componentLoaders.delete(route);
        }));
        const loader = new ConnectableObservable(loadRunner, () => new Subject()).pipe(refCount());
        this.componentLoaders.set(route, loader);
        return loader;
      }
      loadChildren(parentInjector, route) {
        if (this.childrenLoaders.get(route)) {
          return this.childrenLoaders.get(route);
        } else if (route._loadedRoutes) {
          return of({
            routes: route._loadedRoutes,
            injector: route._loadedInjector
          });
        }
        if (this.onLoadStartListener) {
          this.onLoadStartListener(route);
        }
        const moduleFactoryOrRoutes$ = loadChildren(route, this.compiler, parentInjector, this.onLoadEndListener);
        const loadRunner = moduleFactoryOrRoutes$.pipe(finalize(() => {
          this.childrenLoaders.delete(route);
        }));
        const loader = new ConnectableObservable(loadRunner, () => new Subject()).pipe(refCount());
        this.childrenLoaders.set(route, loader);
        return loader;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RouterConfigLoader,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RouterConfigLoader,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: RouterConfigLoader,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    UrlHandlingStrategy = class _UrlHandlingStrategy {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _UrlHandlingStrategy,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _UrlHandlingStrategy,
        providedIn: "root",
        useFactory: () => inject(DefaultUrlHandlingStrategy)
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: UrlHandlingStrategy,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root",
          useFactory: () => inject(DefaultUrlHandlingStrategy)
        }]
      }]
    });
    DefaultUrlHandlingStrategy = class _DefaultUrlHandlingStrategy {
      shouldProcessUrl(url) {
        return true;
      }
      extract(url) {
        return url;
      }
      merge(newUrlPart, wholeUrl) {
        return newUrlPart;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _DefaultUrlHandlingStrategy,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _DefaultUrlHandlingStrategy,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: DefaultUrlHandlingStrategy,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    CREATE_VIEW_TRANSITION = new InjectionToken(ngDevMode ? "view transition helper" : "");
    VIEW_TRANSITION_OPTIONS = new InjectionToken(ngDevMode ? "view transition options" : "");
    NAVIGATION_ERROR_HANDLER = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "navigation error handler" : "");
    NavigationTransitions = class _NavigationTransitions {
      currentNavigation = null;
      currentTransition = null;
      lastSuccessfulNavigation = null;
      /**
       * These events are used to communicate back to the Router about the state of the transition. The
       * Router wants to respond to these events in various ways. Because the `NavigationTransition`
       * class is not public, this event subject is not publicly exposed.
       */
      events = new Subject();
      /**
       * Used to abort the current transition with an error.
       */
      transitionAbortSubject = new Subject();
      configLoader = inject(RouterConfigLoader);
      environmentInjector = inject(EnvironmentInjector);
      destroyRef = inject(DestroyRef);
      urlSerializer = inject(UrlSerializer);
      rootContexts = inject(ChildrenOutletContexts);
      location = inject(Location);
      inputBindingEnabled = inject(INPUT_BINDER, {
        optional: true
      }) !== null;
      titleStrategy = inject(TitleStrategy);
      options = inject(ROUTER_CONFIGURATION, {
        optional: true
      }) || {};
      paramsInheritanceStrategy = this.options.paramsInheritanceStrategy || "emptyOnly";
      urlHandlingStrategy = inject(UrlHandlingStrategy);
      createViewTransition = inject(CREATE_VIEW_TRANSITION, {
        optional: true
      });
      navigationErrorHandler = inject(NAVIGATION_ERROR_HANDLER, {
        optional: true
      });
      navigationId = 0;
      get hasRequestedNavigation() {
        return this.navigationId !== 0;
      }
      transitions;
      /**
       * Hook that enables you to pause navigation after the preactivation phase.
       * Used by `RouterModule`.
       *
       * @internal
       */
      afterPreactivation = () => of(void 0);
      /** @internal */
      rootComponentType = null;
      destroyed = false;
      constructor() {
        const onLoadStart = (r) => this.events.next(new RouteConfigLoadStart(r));
        const onLoadEnd = (r) => this.events.next(new RouteConfigLoadEnd(r));
        this.configLoader.onLoadEndListener = onLoadEnd;
        this.configLoader.onLoadStartListener = onLoadStart;
        this.destroyRef.onDestroy(() => {
          this.destroyed = true;
        });
      }
      complete() {
        this.transitions?.complete();
      }
      handleNavigationRequest(request) {
        const id = ++this.navigationId;
        this.transitions?.next(__spreadProps(__spreadValues({}, request), {
          extractedUrl: this.urlHandlingStrategy.extract(request.rawUrl),
          targetSnapshot: null,
          targetRouterState: null,
          guards: {
            canActivateChecks: [],
            canDeactivateChecks: []
          },
          guardsResult: null,
          id
        }));
      }
      setupNavigations(router) {
        this.transitions = new BehaviorSubject(null);
        return this.transitions.pipe(
          filter((t) => t !== null),
          // Using switchMap so we cancel executing navigations when a new one comes in
          switchMap((overallTransitionState) => {
            let completed = false;
            let errored = false;
            return of(overallTransitionState).pipe(
              switchMap((t) => {
                if (this.navigationId > overallTransitionState.id) {
                  const cancellationReason = typeof ngDevMode === "undefined" || ngDevMode ? `Navigation ID ${overallTransitionState.id} is not equal to the current navigation id ${this.navigationId}` : "";
                  this.cancelNavigationTransition(overallTransitionState, cancellationReason, NavigationCancellationCode.SupersededByNewNavigation);
                  return EMPTY;
                }
                this.currentTransition = overallTransitionState;
                this.currentNavigation = {
                  id: t.id,
                  initialUrl: t.rawUrl,
                  extractedUrl: t.extractedUrl,
                  targetBrowserUrl: typeof t.extras.browserUrl === "string" ? this.urlSerializer.parse(t.extras.browserUrl) : t.extras.browserUrl,
                  trigger: t.source,
                  extras: t.extras,
                  previousNavigation: !this.lastSuccessfulNavigation ? null : __spreadProps(__spreadValues({}, this.lastSuccessfulNavigation), {
                    previousNavigation: null
                  })
                };
                const urlTransition = !router.navigated || this.isUpdatingInternalState() || this.isUpdatedBrowserUrl();
                const onSameUrlNavigation = t.extras.onSameUrlNavigation ?? router.onSameUrlNavigation;
                if (!urlTransition && onSameUrlNavigation !== "reload") {
                  const reason = typeof ngDevMode === "undefined" || ngDevMode ? `Navigation to ${t.rawUrl} was ignored because it is the same as the current Router URL.` : "";
                  this.events.next(new NavigationSkipped(t.id, this.urlSerializer.serialize(t.rawUrl), reason, NavigationSkippedCode.IgnoredSameUrlNavigation));
                  t.resolve(false);
                  return EMPTY;
                }
                if (this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl)) {
                  return of(t).pipe(
                    // Fire NavigationStart event
                    switchMap((t2) => {
                      this.events.next(new NavigationStart(t2.id, this.urlSerializer.serialize(t2.extractedUrl), t2.source, t2.restoredState));
                      if (t2.id !== this.navigationId) {
                        return EMPTY;
                      }
                      return Promise.resolve(t2);
                    }),
                    // Recognize
                    recognize(this.environmentInjector, this.configLoader, this.rootComponentType, router.config, this.urlSerializer, this.paramsInheritanceStrategy),
                    // Update URL if in `eager` update mode
                    tap((t2) => {
                      overallTransitionState.targetSnapshot = t2.targetSnapshot;
                      overallTransitionState.urlAfterRedirects = t2.urlAfterRedirects;
                      this.currentNavigation = __spreadProps(__spreadValues({}, this.currentNavigation), {
                        finalUrl: t2.urlAfterRedirects
                      });
                      const routesRecognized = new RoutesRecognized(t2.id, this.urlSerializer.serialize(t2.extractedUrl), this.urlSerializer.serialize(t2.urlAfterRedirects), t2.targetSnapshot);
                      this.events.next(routesRecognized);
                    })
                  );
                } else if (urlTransition && this.urlHandlingStrategy.shouldProcessUrl(t.currentRawUrl)) {
                  const {
                    id,
                    extractedUrl,
                    source,
                    restoredState,
                    extras
                  } = t;
                  const navStart = new NavigationStart(id, this.urlSerializer.serialize(extractedUrl), source, restoredState);
                  this.events.next(navStart);
                  const targetSnapshot = createEmptyState(this.rootComponentType).snapshot;
                  this.currentTransition = overallTransitionState = __spreadProps(__spreadValues({}, t), {
                    targetSnapshot,
                    urlAfterRedirects: extractedUrl,
                    extras: __spreadProps(__spreadValues({}, extras), {
                      skipLocationChange: false,
                      replaceUrl: false
                    })
                  });
                  this.currentNavigation.finalUrl = extractedUrl;
                  return of(overallTransitionState);
                } else {
                  const reason = typeof ngDevMode === "undefined" || ngDevMode ? `Navigation was ignored because the UrlHandlingStrategy indicated neither the current URL ${t.currentRawUrl} nor target URL ${t.rawUrl} should be processed.` : "";
                  this.events.next(new NavigationSkipped(t.id, this.urlSerializer.serialize(t.extractedUrl), reason, NavigationSkippedCode.IgnoredByUrlHandlingStrategy));
                  t.resolve(false);
                  return EMPTY;
                }
              }),
              // --- GUARDS ---
              tap((t) => {
                const guardsStart = new GuardsCheckStart(t.id, this.urlSerializer.serialize(t.extractedUrl), this.urlSerializer.serialize(t.urlAfterRedirects), t.targetSnapshot);
                this.events.next(guardsStart);
              }),
              map((t) => {
                this.currentTransition = overallTransitionState = __spreadProps(__spreadValues({}, t), {
                  guards: getAllRouteGuards(t.targetSnapshot, t.currentSnapshot, this.rootContexts)
                });
                return overallTransitionState;
              }),
              checkGuards(this.environmentInjector, (evt) => this.events.next(evt)),
              tap((t) => {
                overallTransitionState.guardsResult = t.guardsResult;
                if (t.guardsResult && typeof t.guardsResult !== "boolean") {
                  throw redirectingNavigationError(this.urlSerializer, t.guardsResult);
                }
                const guardsEnd = new GuardsCheckEnd(t.id, this.urlSerializer.serialize(t.extractedUrl), this.urlSerializer.serialize(t.urlAfterRedirects), t.targetSnapshot, !!t.guardsResult);
                this.events.next(guardsEnd);
              }),
              filter((t) => {
                if (!t.guardsResult) {
                  this.cancelNavigationTransition(t, "", NavigationCancellationCode.GuardRejected);
                  return false;
                }
                return true;
              }),
              // --- RESOLVE ---
              switchTap((t) => {
                if (t.guards.canActivateChecks.length === 0) {
                  return void 0;
                }
                return of(t).pipe(tap((t2) => {
                  const resolveStart = new ResolveStart(t2.id, this.urlSerializer.serialize(t2.extractedUrl), this.urlSerializer.serialize(t2.urlAfterRedirects), t2.targetSnapshot);
                  this.events.next(resolveStart);
                }), switchMap((t2) => {
                  let dataResolved = false;
                  return of(t2).pipe(resolveData(this.paramsInheritanceStrategy, this.environmentInjector), tap({
                    next: () => dataResolved = true,
                    complete: () => {
                      if (!dataResolved) {
                        this.cancelNavigationTransition(t2, typeof ngDevMode === "undefined" || ngDevMode ? `At least one route resolver didn't emit any value.` : "", NavigationCancellationCode.NoDataFromResolver);
                      }
                    }
                  }));
                }), tap((t2) => {
                  const resolveEnd = new ResolveEnd(t2.id, this.urlSerializer.serialize(t2.extractedUrl), this.urlSerializer.serialize(t2.urlAfterRedirects), t2.targetSnapshot);
                  this.events.next(resolveEnd);
                }));
              }),
              // --- LOAD COMPONENTS ---
              switchTap((t) => {
                const loadComponents = (route) => {
                  const loaders = [];
                  if (route.routeConfig?.loadComponent && !route.routeConfig._loadedComponent) {
                    loaders.push(this.configLoader.loadComponent(route.routeConfig).pipe(tap((loadedComponent) => {
                      route.component = loadedComponent;
                    }), map(() => void 0)));
                  }
                  for (const child of route.children) {
                    loaders.push(...loadComponents(child));
                  }
                  return loaders;
                };
                return combineLatest(loadComponents(t.targetSnapshot.root)).pipe(defaultIfEmpty(null), take(1));
              }),
              switchTap(() => this.afterPreactivation()),
              switchMap(() => {
                const {
                  currentSnapshot,
                  targetSnapshot
                } = overallTransitionState;
                const viewTransitionStarted = this.createViewTransition?.(this.environmentInjector, currentSnapshot.root, targetSnapshot.root);
                return viewTransitionStarted ? from(viewTransitionStarted).pipe(map(() => overallTransitionState)) : of(overallTransitionState);
              }),
              map((t) => {
                const targetRouterState = createRouterState(router.routeReuseStrategy, t.targetSnapshot, t.currentRouterState);
                this.currentTransition = overallTransitionState = __spreadProps(__spreadValues({}, t), {
                  targetRouterState
                });
                this.currentNavigation.targetRouterState = targetRouterState;
                return overallTransitionState;
              }),
              tap(() => {
                this.events.next(new BeforeActivateRoutes());
              }),
              activateRoutes(this.rootContexts, router.routeReuseStrategy, (evt) => this.events.next(evt), this.inputBindingEnabled),
              // Ensure that if some observable used to drive the transition doesn't
              // complete, the navigation still finalizes This should never happen, but
              // this is done as a safety measure to avoid surfacing this error (#49567).
              take(1),
              tap({
                next: (t) => {
                  completed = true;
                  this.lastSuccessfulNavigation = this.currentNavigation;
                  this.events.next(new NavigationEnd(t.id, this.urlSerializer.serialize(t.extractedUrl), this.urlSerializer.serialize(t.urlAfterRedirects)));
                  this.titleStrategy?.updateTitle(t.targetRouterState.snapshot);
                  t.resolve(true);
                },
                complete: () => {
                  completed = true;
                }
              }),
              // There used to be a lot more logic happening directly within the
              // transition Observable. Some of this logic has been refactored out to
              // other places but there may still be errors that happen there. This gives
              // us a way to cancel the transition from the outside. This may also be
              // required in the future to support something like the abort signal of the
              // Navigation API where the navigation gets aborted from outside the
              // transition.
              takeUntil(this.transitionAbortSubject.pipe(tap((err) => {
                throw err;
              }))),
              finalize(() => {
                if (!completed && !errored) {
                  const cancelationReason = typeof ngDevMode === "undefined" || ngDevMode ? `Navigation ID ${overallTransitionState.id} is not equal to the current navigation id ${this.navigationId}` : "";
                  this.cancelNavigationTransition(overallTransitionState, cancelationReason, NavigationCancellationCode.SupersededByNewNavigation);
                }
                if (this.currentTransition?.id === overallTransitionState.id) {
                  this.currentNavigation = null;
                  this.currentTransition = null;
                }
              }),
              catchError((e) => {
                if (this.destroyed) {
                  overallTransitionState.resolve(false);
                  return EMPTY;
                }
                errored = true;
                if (isNavigationCancelingError(e)) {
                  this.events.next(new NavigationCancel(overallTransitionState.id, this.urlSerializer.serialize(overallTransitionState.extractedUrl), e.message, e.cancellationCode));
                  if (!isRedirectingNavigationCancelingError(e)) {
                    overallTransitionState.resolve(false);
                  } else {
                    this.events.next(new RedirectRequest(e.url, e.navigationBehaviorOptions));
                  }
                } else {
                  const navigationError = new NavigationError(overallTransitionState.id, this.urlSerializer.serialize(overallTransitionState.extractedUrl), e, overallTransitionState.targetSnapshot ?? void 0);
                  try {
                    const navigationErrorHandlerResult = runInInjectionContext(this.environmentInjector, () => this.navigationErrorHandler?.(navigationError));
                    if (navigationErrorHandlerResult instanceof RedirectCommand) {
                      const {
                        message,
                        cancellationCode
                      } = redirectingNavigationError(this.urlSerializer, navigationErrorHandlerResult);
                      this.events.next(new NavigationCancel(overallTransitionState.id, this.urlSerializer.serialize(overallTransitionState.extractedUrl), message, cancellationCode));
                      this.events.next(new RedirectRequest(navigationErrorHandlerResult.redirectTo, navigationErrorHandlerResult.navigationBehaviorOptions));
                    } else {
                      this.events.next(navigationError);
                      throw e;
                    }
                  } catch (ee) {
                    if (this.options.resolveNavigationPromiseOnError) {
                      overallTransitionState.resolve(false);
                    } else {
                      overallTransitionState.reject(ee);
                    }
                  }
                }
                return EMPTY;
              })
            );
          })
        );
      }
      cancelNavigationTransition(t, reason, code) {
        const navCancel = new NavigationCancel(t.id, this.urlSerializer.serialize(t.extractedUrl), reason, code);
        this.events.next(navCancel);
        t.resolve(false);
      }
      /**
       * @returns Whether we're navigating to somewhere that is not what the Router is
       * currently set to.
       */
      isUpdatingInternalState() {
        return this.currentTransition?.extractedUrl.toString() !== this.currentTransition?.currentUrlTree.toString();
      }
      /**
       * @returns Whether we're updating the browser URL to something new (navigation is going
       * to somewhere not displayed in the URL bar and we will update the URL
       * bar if navigation succeeds).
       */
      isUpdatedBrowserUrl() {
        const currentBrowserUrl = this.urlHandlingStrategy.extract(this.urlSerializer.parse(this.location.path(true)));
        const targetBrowserUrl = this.currentNavigation?.targetBrowserUrl ?? this.currentNavigation?.extractedUrl;
        return currentBrowserUrl.toString() !== targetBrowserUrl?.toString() && !this.currentNavigation?.extras.skipLocationChange;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _NavigationTransitions,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _NavigationTransitions,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: NavigationTransitions,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }],
      ctorParameters: () => []
    });
    RouteReuseStrategy = class _RouteReuseStrategy {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RouteReuseStrategy,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _RouteReuseStrategy,
        providedIn: "root",
        useFactory: () => inject(DefaultRouteReuseStrategy)
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: RouteReuseStrategy,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root",
          useFactory: () => inject(DefaultRouteReuseStrategy)
        }]
      }]
    });
    BaseRouteReuseStrategy = class {
      /**
       * Whether the given route should detach for later reuse.
       * Always returns false for `BaseRouteReuseStrategy`.
       * */
      shouldDetach(route) {
        return false;
      }
      /**
       * A no-op; the route is never stored since this strategy never detaches routes for later re-use.
       */
      store(route, detachedTree) {
      }
      /** Returns `false`, meaning the route (and its subtree) is never reattached */
      shouldAttach(route) {
        return false;
      }
      /** Returns `null` because this strategy does not store routes for later re-use. */
      retrieve(route) {
        return null;
      }
      /**
       * Determines if a route should be reused.
       * This strategy returns `true` when the future route config and current route config are
       * identical.
       */
      shouldReuseRoute(future, curr) {
        return future.routeConfig === curr.routeConfig;
      }
    };
    DefaultRouteReuseStrategy = class _DefaultRouteReuseStrategy extends BaseRouteReuseStrategy {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _DefaultRouteReuseStrategy,
        deps: null,
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _DefaultRouteReuseStrategy,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: DefaultRouteReuseStrategy,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    StateManager = class _StateManager {
      urlSerializer = inject(UrlSerializer);
      options = inject(ROUTER_CONFIGURATION, {
        optional: true
      }) || {};
      canceledNavigationResolution = this.options.canceledNavigationResolution || "replace";
      location = inject(Location);
      urlHandlingStrategy = inject(UrlHandlingStrategy);
      urlUpdateStrategy = this.options.urlUpdateStrategy || "deferred";
      currentUrlTree = new UrlTree();
      /**
       * Returns the currently activated `UrlTree`.
       *
       * This `UrlTree` shows only URLs that the `Router` is configured to handle (through
       * `UrlHandlingStrategy`).
       *
       * The value is set after finding the route config tree to activate but before activating the
       * route.
       */
      getCurrentUrlTree() {
        return this.currentUrlTree;
      }
      rawUrlTree = this.currentUrlTree;
      /**
       * Returns a `UrlTree` that is represents what the browser is actually showing.
       *
       * In the life of a navigation transition:
       * 1. When a navigation begins, the raw `UrlTree` is updated to the full URL that's being
       * navigated to.
       * 2. During a navigation, redirects are applied, which might only apply to _part_ of the URL (due
       * to `UrlHandlingStrategy`).
       * 3. Just before activation, the raw `UrlTree` is updated to include the redirects on top of the
       * original raw URL.
       *
       * Note that this is _only_ here to support `UrlHandlingStrategy.extract` and
       * `UrlHandlingStrategy.shouldProcessUrl`. Without those APIs, the current `UrlTree` would not
       * deviated from the raw `UrlTree`.
       *
       * For `extract`, a raw `UrlTree` is needed because `extract` may only return part
       * of the navigation URL. Thus, the current `UrlTree` may only represent _part_ of the browser
       * URL. When a navigation gets cancelled and the router needs to reset the URL or a new navigation
       * occurs, it needs to know the _whole_ browser URL, not just the part handled by
       * `UrlHandlingStrategy`.
       * For `shouldProcessUrl`, when the return is `false`, the router ignores the navigation but
       * still updates the raw `UrlTree` with the assumption that the navigation was caused by the
       * location change listener due to a URL update by the AngularJS router. In this case, the router
       * still need to know what the browser's URL is for future navigations.
       */
      getRawUrlTree() {
        return this.rawUrlTree;
      }
      createBrowserPath({
        finalUrl,
        initialUrl,
        targetBrowserUrl
      }) {
        const rawUrl = finalUrl !== void 0 ? this.urlHandlingStrategy.merge(finalUrl, initialUrl) : initialUrl;
        const url = targetBrowserUrl ?? rawUrl;
        const path = url instanceof UrlTree ? this.urlSerializer.serialize(url) : url;
        return path;
      }
      commitTransition({
        targetRouterState,
        finalUrl,
        initialUrl
      }) {
        if (finalUrl && targetRouterState) {
          this.currentUrlTree = finalUrl;
          this.rawUrlTree = this.urlHandlingStrategy.merge(finalUrl, initialUrl);
          this.routerState = targetRouterState;
        } else {
          this.rawUrlTree = initialUrl;
        }
      }
      routerState = createEmptyState(null);
      /** Returns the current RouterState. */
      getRouterState() {
        return this.routerState;
      }
      stateMemento = this.createStateMemento();
      updateStateMemento() {
        this.stateMemento = this.createStateMemento();
      }
      createStateMemento() {
        return {
          rawUrlTree: this.rawUrlTree,
          currentUrlTree: this.currentUrlTree,
          routerState: this.routerState
        };
      }
      resetInternalState({
        finalUrl
      }) {
        this.routerState = this.stateMemento.routerState;
        this.currentUrlTree = this.stateMemento.currentUrlTree;
        this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, finalUrl ?? this.rawUrlTree);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _StateManager,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _StateManager,
        providedIn: "root",
        useFactory: () => inject(HistoryStateManager)
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: StateManager,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root",
          useFactory: () => inject(HistoryStateManager)
        }]
      }]
    });
    HistoryStateManager = class _HistoryStateManager extends StateManager {
      /**
       * The id of the currently active page in the router.
       * Updated to the transition's target id on a successful navigation.
       *
       * This is used to track what page the router last activated. When an attempted navigation fails,
       * the router can then use this to compute how to restore the state back to the previously active
       * page.
       */
      currentPageId = 0;
      lastSuccessfulId = -1;
      restoredState() {
        return this.location.getState();
      }
      /**
       * The ɵrouterPageId of whatever page is currently active in the browser history. This is
       * important for computing the target page id for new navigations because we need to ensure each
       * page id in the browser history is 1 more than the previous entry.
       */
      get browserPageId() {
        if (this.canceledNavigationResolution !== "computed") {
          return this.currentPageId;
        }
        return this.restoredState()?.\u0275routerPageId ?? this.currentPageId;
      }
      registerNonRouterCurrentEntryChangeListener(listener) {
        return this.location.subscribe((event) => {
          if (event["type"] === "popstate") {
            setTimeout(() => {
              listener(event["url"], event.state, "popstate");
            });
          }
        });
      }
      handleRouterEvent(e, currentTransition) {
        if (e instanceof NavigationStart) {
          this.updateStateMemento();
        } else if (e instanceof NavigationSkipped) {
          this.commitTransition(currentTransition);
        } else if (e instanceof RoutesRecognized) {
          if (this.urlUpdateStrategy === "eager") {
            if (!currentTransition.extras.skipLocationChange) {
              this.setBrowserUrl(this.createBrowserPath(currentTransition), currentTransition);
            }
          }
        } else if (e instanceof BeforeActivateRoutes) {
          this.commitTransition(currentTransition);
          if (this.urlUpdateStrategy === "deferred" && !currentTransition.extras.skipLocationChange) {
            this.setBrowserUrl(this.createBrowserPath(currentTransition), currentTransition);
          }
        } else if (e instanceof NavigationCancel && (e.code === NavigationCancellationCode.GuardRejected || e.code === NavigationCancellationCode.NoDataFromResolver)) {
          this.restoreHistory(currentTransition);
        } else if (e instanceof NavigationError) {
          this.restoreHistory(currentTransition, true);
        } else if (e instanceof NavigationEnd) {
          this.lastSuccessfulId = e.id;
          this.currentPageId = this.browserPageId;
        }
      }
      setBrowserUrl(path, {
        extras,
        id
      }) {
        const {
          replaceUrl,
          state: state2
        } = extras;
        if (this.location.isCurrentPathEqualTo(path) || !!replaceUrl) {
          const currentBrowserPageId = this.browserPageId;
          const newState = __spreadValues(__spreadValues({}, state2), this.generateNgRouterState(id, currentBrowserPageId));
          this.location.replaceState(path, "", newState);
        } else {
          const newState = __spreadValues(__spreadValues({}, state2), this.generateNgRouterState(id, this.browserPageId + 1));
          this.location.go(path, "", newState);
        }
      }
      /**
       * Performs the necessary rollback action to restore the browser URL to the
       * state before the transition.
       */
      restoreHistory(navigation, restoringFromCaughtError = false) {
        if (this.canceledNavigationResolution === "computed") {
          const currentBrowserPageId = this.browserPageId;
          const targetPagePosition = this.currentPageId - currentBrowserPageId;
          if (targetPagePosition !== 0) {
            this.location.historyGo(targetPagePosition);
          } else if (this.getCurrentUrlTree() === navigation.finalUrl && targetPagePosition === 0) {
            this.resetInternalState(navigation);
            this.resetUrlToCurrentUrlTree();
          } else ;
        } else if (this.canceledNavigationResolution === "replace") {
          if (restoringFromCaughtError) {
            this.resetInternalState(navigation);
          }
          this.resetUrlToCurrentUrlTree();
        }
      }
      resetUrlToCurrentUrlTree() {
        this.location.replaceState(this.urlSerializer.serialize(this.getRawUrlTree()), "", this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId));
      }
      generateNgRouterState(navigationId, routerPageId) {
        if (this.canceledNavigationResolution === "computed") {
          return {
            navigationId,
            \u0275routerPageId: routerPageId
          };
        }
        return {
          navigationId
        };
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _HistoryStateManager,
        deps: null,
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _HistoryStateManager,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: HistoryStateManager,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    exactMatchOptions = {
      paths: "exact",
      fragment: "ignored",
      matrixParams: "ignored",
      queryParams: "exact"
    };
    subsetMatchOptions = {
      paths: "subset",
      fragment: "ignored",
      matrixParams: "ignored",
      queryParams: "subset"
    };
    Router = class _Router {
      get currentUrlTree() {
        return this.stateManager.getCurrentUrlTree();
      }
      get rawUrlTree() {
        return this.stateManager.getRawUrlTree();
      }
      disposed = false;
      nonRouterCurrentEntryChangeSubscription;
      console = inject(Console);
      stateManager = inject(StateManager);
      options = inject(ROUTER_CONFIGURATION, {
        optional: true
      }) || {};
      pendingTasks = inject(PendingTasksInternal);
      urlUpdateStrategy = this.options.urlUpdateStrategy || "deferred";
      navigationTransitions = inject(NavigationTransitions);
      urlSerializer = inject(UrlSerializer);
      location = inject(Location);
      urlHandlingStrategy = inject(UrlHandlingStrategy);
      /**
       * The private `Subject` type for the public events exposed in the getter. This is used internally
       * to push events to. The separate field allows us to expose separate types in the public API
       * (i.e., an Observable rather than the Subject).
       */
      _events = new Subject();
      /**
       * An event stream for routing events.
       */
      get events() {
        return this._events;
      }
      /**
       * The current state of routing in this NgModule.
       */
      get routerState() {
        return this.stateManager.getRouterState();
      }
      /**
       * True if at least one navigation event has occurred,
       * false otherwise.
       */
      navigated = false;
      /**
       * A strategy for re-using routes.
       *
       * @deprecated Configure using `providers` instead:
       *   `{provide: RouteReuseStrategy, useClass: MyStrategy}`.
       */
      routeReuseStrategy = inject(RouteReuseStrategy);
      /**
       * How to handle a navigation request to the current URL.
       *
       *
       * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
       * @see {@link withRouterConfig}
       * @see {@link provideRouter}
       * @see {@link RouterModule}
       */
      onSameUrlNavigation = this.options.onSameUrlNavigation || "ignore";
      config = inject(ROUTES, {
        optional: true
      })?.flat() ?? [];
      /**
       * Indicates whether the application has opted in to binding Router data to component inputs.
       *
       * This option is enabled by the `withComponentInputBinding` feature of `provideRouter` or
       * `bindToComponentInputs` in the `ExtraOptions` of `RouterModule.forRoot`.
       */
      componentInputBindingEnabled = !!inject(INPUT_BINDER, {
        optional: true
      });
      constructor() {
        this.resetConfig(this.config);
        this.navigationTransitions.setupNavigations(this).subscribe({
          error: (e) => {
            this.console.warn(ngDevMode ? `Unhandled Navigation Error: ${e}` : e);
          }
        });
        this.subscribeToNavigationEvents();
      }
      eventsSubscription = new Subscription();
      subscribeToNavigationEvents() {
        const subscription = this.navigationTransitions.events.subscribe((e) => {
          try {
            const currentTransition = this.navigationTransitions.currentTransition;
            const currentNavigation = this.navigationTransitions.currentNavigation;
            if (currentTransition !== null && currentNavigation !== null) {
              this.stateManager.handleRouterEvent(e, currentNavigation);
              if (e instanceof NavigationCancel && e.code !== NavigationCancellationCode.Redirect && e.code !== NavigationCancellationCode.SupersededByNewNavigation) {
                this.navigated = true;
              } else if (e instanceof NavigationEnd) {
                this.navigated = true;
              } else if (e instanceof RedirectRequest) {
                const opts = e.navigationBehaviorOptions;
                const mergedTree = this.urlHandlingStrategy.merge(e.url, currentTransition.currentRawUrl);
                const extras = __spreadValues({
                  browserUrl: currentTransition.extras.browserUrl,
                  info: currentTransition.extras.info,
                  skipLocationChange: currentTransition.extras.skipLocationChange,
                  // The URL is already updated at this point if we have 'eager' URL
                  // updates or if the navigation was triggered by the browser (back
                  // button, URL bar, etc). We want to replace that item in history
                  // if the navigation is rejected.
                  replaceUrl: currentTransition.extras.replaceUrl || this.urlUpdateStrategy === "eager" || isBrowserTriggeredNavigation(currentTransition.source)
                }, opts);
                this.scheduleNavigation(mergedTree, IMPERATIVE_NAVIGATION, null, extras, {
                  resolve: currentTransition.resolve,
                  reject: currentTransition.reject,
                  promise: currentTransition.promise
                });
              }
            }
            if (isPublicRouterEvent(e)) {
              this._events.next(e);
            }
          } catch (e2) {
            this.navigationTransitions.transitionAbortSubject.next(e2);
          }
        });
        this.eventsSubscription.add(subscription);
      }
      /** @internal */
      resetRootComponentType(rootComponentType) {
        this.routerState.root.component = rootComponentType;
        this.navigationTransitions.rootComponentType = rootComponentType;
      }
      /**
       * Sets up the location change listener and performs the initial navigation.
       */
      initialNavigation() {
        this.setUpLocationChangeListener();
        if (!this.navigationTransitions.hasRequestedNavigation) {
          this.navigateToSyncWithBrowser(this.location.path(true), IMPERATIVE_NAVIGATION, this.stateManager.restoredState());
        }
      }
      /**
       * Sets up the location change listener. This listener detects navigations triggered from outside
       * the Router (the browser back/forward buttons, for example) and schedules a corresponding Router
       * navigation so that the correct events, guards, etc. are triggered.
       */
      setUpLocationChangeListener() {
        this.nonRouterCurrentEntryChangeSubscription ??= this.stateManager.registerNonRouterCurrentEntryChangeListener((url, state2, source) => {
          this.navigateToSyncWithBrowser(url, source, state2);
        });
      }
      /**
       * Schedules a router navigation to synchronize Router state with the browser state.
       *
       * This is done as a response to a popstate event and the initial navigation. These
       * two scenarios represent times when the browser URL/state has been updated and
       * the Router needs to respond to ensure its internal state matches.
       */
      navigateToSyncWithBrowser(url, source, state2) {
        const extras = {
          replaceUrl: true
        };
        const restoredState = state2?.navigationId ? state2 : null;
        if (state2) {
          const stateCopy = __spreadValues({}, state2);
          delete stateCopy.navigationId;
          delete stateCopy.\u0275routerPageId;
          if (Object.keys(stateCopy).length !== 0) {
            extras.state = stateCopy;
          }
        }
        const urlTree = this.parseUrl(url);
        this.scheduleNavigation(urlTree, source, restoredState, extras);
      }
      /** The current URL. */
      get url() {
        return this.serializeUrl(this.currentUrlTree);
      }
      /**
       * Returns the current `Navigation` object when the router is navigating,
       * and `null` when idle.
       */
      getCurrentNavigation() {
        return this.navigationTransitions.currentNavigation;
      }
      /**
       * The `Navigation` object of the most recent navigation to succeed and `null` if there
       *     has not been a successful navigation yet.
       */
      get lastSuccessfulNavigation() {
        return this.navigationTransitions.lastSuccessfulNavigation;
      }
      /**
       * Resets the route configuration used for navigation and generating links.
       *
       * @param config The route array for the new configuration.
       *
       * @usageNotes
       *
       * ```ts
       * router.resetConfig([
       *  { path: 'team/:id', component: TeamCmp, children: [
       *    { path: 'simple', component: SimpleCmp },
       *    { path: 'user/:name', component: UserCmp }
       *  ]}
       * ]);
       * ```
       */
      resetConfig(config) {
        (typeof ngDevMode === "undefined" || ngDevMode) && validateConfig(config);
        this.config = config.map(standardizeConfig);
        this.navigated = false;
      }
      /** @docs-private */
      ngOnDestroy() {
        this.dispose();
      }
      /** Disposes of the router. */
      dispose() {
        this._events.unsubscribe();
        this.navigationTransitions.complete();
        if (this.nonRouterCurrentEntryChangeSubscription) {
          this.nonRouterCurrentEntryChangeSubscription.unsubscribe();
          this.nonRouterCurrentEntryChangeSubscription = void 0;
        }
        this.disposed = true;
        this.eventsSubscription.unsubscribe();
      }
      /**
       * Appends URL segments to the current URL tree to create a new URL tree.
       *
       * @param commands An array of URL fragments with which to construct the new URL tree.
       * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
       * segments, followed by the parameters for each segment.
       * The fragments are applied to the current URL tree or the one provided  in the `relativeTo`
       * property of the options object, if supplied.
       * @param navigationExtras Options that control the navigation strategy.
       * @returns The new URL tree.
       *
       * @usageNotes
       *
       * ```
       * // create /team/33/user/11
       * router.createUrlTree(['/team', 33, 'user', 11]);
       *
       * // create /team/33;expand=true/user/11
       * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
       *
       * // you can collapse static segments like this (this works only with the first passed-in value):
       * router.createUrlTree(['/team/33/user', userId]);
       *
       * // If the first segment can contain slashes, and you do not want the router to split it,
       * // you can do the following:
       * router.createUrlTree([{segmentPath: '/one/two'}]);
       *
       * // create /team/33/(user/11//right:chat)
       * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: 'chat'}}]);
       *
       * // remove the right secondary node
       * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
       *
       * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
       *
       * // navigate to /team/33/user/11/details
       * router.createUrlTree(['details'], {relativeTo: route});
       *
       * // navigate to /team/33/user/22
       * router.createUrlTree(['../22'], {relativeTo: route});
       *
       * // navigate to /team/44/user/22
       * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
       *
       * Note that a value of `null` or `undefined` for `relativeTo` indicates that the
       * tree should be created relative to the root.
       * ```
       */
      createUrlTree(commands, navigationExtras = {}) {
        const {
          relativeTo,
          queryParams,
          fragment,
          queryParamsHandling,
          preserveFragment
        } = navigationExtras;
        const f = preserveFragment ? this.currentUrlTree.fragment : fragment;
        let q = null;
        switch (queryParamsHandling ?? this.options.defaultQueryParamsHandling) {
          case "merge":
            q = __spreadValues(__spreadValues({}, this.currentUrlTree.queryParams), queryParams);
            break;
          case "preserve":
            q = this.currentUrlTree.queryParams;
            break;
          default:
            q = queryParams || null;
        }
        if (q !== null) {
          q = this.removeEmptyProps(q);
        }
        let relativeToUrlSegmentGroup;
        try {
          const relativeToSnapshot = relativeTo ? relativeTo.snapshot : this.routerState.snapshot.root;
          relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeToSnapshot);
        } catch (e) {
          if (typeof commands[0] !== "string" || commands[0][0] !== "/") {
            commands = [];
          }
          relativeToUrlSegmentGroup = this.currentUrlTree.root;
        }
        return createUrlTreeFromSegmentGroup(relativeToUrlSegmentGroup, commands, q, f ?? null);
      }
      /**
       * Navigates to a view using an absolute route path.
       *
       * @param url An absolute path for a defined route. The function does not apply any delta to the
       *     current URL.
       * @param extras An object containing properties that modify the navigation strategy.
       *
       * @returns A Promise that resolves to 'true' when navigation succeeds,
       * to 'false' when navigation fails, or is rejected on error.
       *
       * @usageNotes
       *
       * The following calls request navigation to an absolute path.
       *
       * ```ts
       * router.navigateByUrl("/team/33/user/11");
       *
       * // Navigate without updating the URL
       * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
       * ```
       *
       * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
       *
       */
      navigateByUrl(url, extras = {
        skipLocationChange: false
      }) {
        const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
        const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);
        return this.scheduleNavigation(mergedTree, IMPERATIVE_NAVIGATION, null, extras);
      }
      /**
       * Navigate based on the provided array of commands and a starting point.
       * If no starting route is provided, the navigation is absolute.
       *
       * @param commands An array of URL fragments with which to construct the target URL.
       * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
       * segments, followed by the parameters for each segment.
       * The fragments are applied to the current URL or the one provided  in the `relativeTo` property
       * of the options object, if supplied.
       * @param extras An options object that determines how the URL should be constructed or
       *     interpreted.
       *
       * @returns A Promise that resolves to `true` when navigation succeeds, or `false` when navigation
       *     fails. The Promise is rejected when an error occurs if `resolveNavigationPromiseOnError` is
       * not `true`.
       *
       * @usageNotes
       *
       * The following calls request navigation to a dynamic route path relative to the current URL.
       *
       * ```ts
       * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
       *
       * // Navigate without updating the URL, overriding the default behavior
       * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
       * ```
       *
       * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
       *
       */
      navigate(commands, extras = {
        skipLocationChange: false
      }) {
        validateCommands(commands);
        return this.navigateByUrl(this.createUrlTree(commands, extras), extras);
      }
      /** Serializes a `UrlTree` into a string */
      serializeUrl(url) {
        return this.urlSerializer.serialize(url);
      }
      /** Parses a string into a `UrlTree` */
      parseUrl(url) {
        try {
          return this.urlSerializer.parse(url);
        } catch {
          return this.urlSerializer.parse("/");
        }
      }
      isActive(url, matchOptions) {
        let options;
        if (matchOptions === true) {
          options = __spreadValues({}, exactMatchOptions);
        } else if (matchOptions === false) {
          options = __spreadValues({}, subsetMatchOptions);
        } else {
          options = matchOptions;
        }
        if (isUrlTree(url)) {
          return containsTree(this.currentUrlTree, url, options);
        }
        const urlTree = this.parseUrl(url);
        return containsTree(this.currentUrlTree, urlTree, options);
      }
      removeEmptyProps(params) {
        return Object.entries(params).reduce((result, [key, value]) => {
          if (value !== null && value !== void 0) {
            result[key] = value;
          }
          return result;
        }, {});
      }
      scheduleNavigation(rawUrl, source, restoredState, extras, priorPromise) {
        if (this.disposed) {
          return Promise.resolve(false);
        }
        let resolve2;
        let reject;
        let promise;
        if (priorPromise) {
          resolve2 = priorPromise.resolve;
          reject = priorPromise.reject;
          promise = priorPromise.promise;
        } else {
          promise = new Promise((res, rej) => {
            resolve2 = res;
            reject = rej;
          });
        }
        const taskId = this.pendingTasks.add();
        afterNextNavigation(this, () => {
          queueMicrotask(() => this.pendingTasks.remove(taskId));
        });
        this.navigationTransitions.handleNavigationRequest({
          source,
          restoredState,
          currentUrlTree: this.currentUrlTree,
          currentRawUrl: this.currentUrlTree,
          rawUrl,
          extras,
          resolve: resolve2,
          reject,
          promise,
          currentSnapshot: this.routerState.snapshot,
          currentRouterState: this.routerState
        });
        return promise.catch((e) => {
          return Promise.reject(e);
        });
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _Router,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _Router,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: Router,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }],
      ctorParameters: () => []
    });
  }
});

// node_modules/@angular/router/fesm2022/router.mjs
var VERSION;
var init_router = __esm({
  "node_modules/@angular/router/fesm2022/router.mjs"() {
    "use strict";
    init_router_Dwfin5Au();
    init_core();
    VERSION = new Version("19.2.14");
  }
});

// node_modules/@primeuix/utils/classnames/index.mjs
var init_classnames = __esm({
  "node_modules/@primeuix/utils/classnames/index.mjs"() {
    "use strict";
  }
});

// node_modules/@primeuix/utils/dom/index.mjs
function hasClass(element, className) {
  if (element) {
    if (element.classList) return element.classList.contains(className);
    else return new RegExp("(^| )" + className + "( |$)", "gi").test(element.className);
  }
  return false;
}
function addClass(element, className) {
  if (element && className) {
    const fn = (_className) => {
      if (!hasClass(element, _className)) {
        if (element.classList) element.classList.add(_className);
        else element.className += " " + _className;
      }
    };
    [className].flat().filter(Boolean).forEach((_classNames) => _classNames.split(" ").forEach(fn));
  }
}
function calculateBodyScrollbarWidth() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function getCSSVariableByRegex(variableRegex) {
  for (const sheet of document == null ? void 0 : document.styleSheets) {
    try {
      for (const rule of sheet == null ? void 0 : sheet.cssRules) {
        for (const property of rule == null ? void 0 : rule.style) {
          if (variableRegex.test(property)) {
            return {
              name: property,
              value: rule.style.getPropertyValue(property).trim()
            };
          }
        }
      }
    } catch (e) {
    }
  }
  return null;
}
function blockBodyScroll(className = "p-overflow-hidden") {
  const variableData = getCSSVariableByRegex(/-scrollbar-width$/);
  (variableData == null ? void 0 : variableData.name) && document.body.style.setProperty(variableData.name, calculateBodyScrollbarWidth() + "px");
  addClass(document.body, className);
}
function removeClass(element, className) {
  if (element && className) {
    const fn = (_className) => {
      if (element.classList) element.classList.remove(_className);
      else element.className = element.className.replace(new RegExp("(^|\\b)" + _className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [className].flat().filter(Boolean).forEach((_classNames) => _classNames.split(" ").forEach(fn));
  }
}
function unblockBodyScroll(className = "p-overflow-hidden") {
  const variableData = getCSSVariableByRegex(/-scrollbar-width$/);
  (variableData == null ? void 0 : variableData.name) && document.body.style.removeProperty(variableData.name);
  removeClass(document.body, className);
}
function getHiddenElementDimensions(element) {
  let dimensions = {
    width: 0,
    height: 0
  };
  if (element) {
    element.style.visibility = "hidden";
    element.style.display = "block";
    dimensions.width = element.offsetWidth;
    dimensions.height = element.offsetHeight;
    element.style.display = "none";
    element.style.visibility = "visible";
  }
  return dimensions;
}
function getViewport() {
  let win = window, d = document, e = d.documentElement, g = d.getElementsByTagName("body")[0], w = win.innerWidth || e.clientWidth || g.clientWidth, h = win.innerHeight || e.clientHeight || g.clientHeight;
  return {
    width: w,
    height: h
  };
}
function getWindowScrollLeft() {
  let doc = document.documentElement;
  return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
}
function getWindowScrollTop() {
  let doc = document.documentElement;
  return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
}
function absolutePosition(element, target, gutter = true) {
  var _a, _b, _c, _d;
  if (element) {
    const elementDimensions = element.offsetParent ? {
      width: element.offsetWidth,
      height: element.offsetHeight
    } : getHiddenElementDimensions(element);
    const elementOuterHeight = elementDimensions.height;
    const elementOuterWidth = elementDimensions.width;
    const targetOuterHeight = target.offsetHeight;
    const targetOuterWidth = target.offsetWidth;
    const targetOffset = target.getBoundingClientRect();
    const windowScrollTop = getWindowScrollTop();
    const windowScrollLeft = getWindowScrollLeft();
    const viewport = getViewport();
    let top, left, origin = "top";
    if (targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
      top = targetOffset.top + windowScrollTop - elementOuterHeight;
      origin = "bottom";
      if (top < 0) {
        top = windowScrollTop;
      }
    } else {
      top = targetOuterHeight + targetOffset.top + windowScrollTop;
    }
    if (targetOffset.left + elementOuterWidth > viewport.width) left = Math.max(0, targetOffset.left + windowScrollLeft + targetOuterWidth - elementOuterWidth);
    else left = targetOffset.left + windowScrollLeft;
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.transformOrigin = origin;
    gutter && (element.style.marginTop = origin === "bottom" ? `calc(${(_b = (_a = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _a.value) != null ? _b : "2px"} * -1)` : (_d = (_c = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _c.value) != null ? _d : "");
  }
}
function addStyle(element, style2) {
  if (element) {
    if (typeof style2 === "string") {
      element.style.cssText = style2;
    } else {
      Object.entries(style2 || {}).forEach(([key, value]) => element.style[key] = value);
    }
  }
}
function getOuterWidth(element, margin) {
  if (element instanceof HTMLElement) {
    let width = element.offsetWidth;
    if (margin) {
      let style2 = getComputedStyle(element);
      width += parseFloat(style2.marginLeft) + parseFloat(style2.marginRight);
    }
    return width;
  }
  return 0;
}
function relativePosition(element, target, gutter = true) {
  var _a, _b, _c, _d;
  if (element) {
    const elementDimensions = element.offsetParent ? {
      width: element.offsetWidth,
      height: element.offsetHeight
    } : getHiddenElementDimensions(element);
    const targetHeight = target.offsetHeight;
    const targetOffset = target.getBoundingClientRect();
    const viewport = getViewport();
    let top, left, origin = "top";
    if (targetOffset.top + targetHeight + elementDimensions.height > viewport.height) {
      top = -1 * elementDimensions.height;
      origin = "bottom";
      if (targetOffset.top + top < 0) {
        top = -1 * targetOffset.top;
      }
    } else {
      top = targetHeight;
    }
    if (elementDimensions.width > viewport.width) {
      left = targetOffset.left * -1;
    } else if (targetOffset.left + elementDimensions.width > viewport.width) {
      left = (targetOffset.left + elementDimensions.width - viewport.width) * -1;
    } else {
      left = 0;
    }
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.transformOrigin = origin;
    gutter && (element.style.marginTop = origin === "bottom" ? `calc(${(_b = (_a = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _a.value) != null ? _b : "2px"} * -1)` : (_d = (_c = getCSSVariableByRegex(/-anchor-gutter$/)) == null ? void 0 : _c.value) != null ? _d : "");
  }
}
function isElement(element) {
  return typeof HTMLElement === "object" ? element instanceof HTMLElement : element && typeof element === "object" && element !== null && element.nodeType === 1 && typeof element.nodeName === "string";
}
function toElement(element) {
  let target = element;
  if (element && typeof element === "object") {
    if (element.hasOwnProperty("current")) {
      target = element.current;
    } else if (element.hasOwnProperty("el")) {
      if (element.el.hasOwnProperty("nativeElement")) {
        target = element.el.nativeElement;
      } else {
        target = element.el;
      }
    }
  }
  return isElement(target) ? target : void 0;
}
function appendChild(element, child) {
  const target = toElement(element);
  if (target) target.appendChild(child);
  else throw new Error("Cannot append " + child + " to " + element);
}
function setAttributes(element, attributes = {}) {
  if (isElement(element)) {
    const computedStyles = (rule, value) => {
      var _a, _b;
      const styles = ((_a = element == null ? void 0 : element.$attrs) == null ? void 0 : _a[rule]) ? [(_b = element == null ? void 0 : element.$attrs) == null ? void 0 : _b[rule]] : [];
      return [value].flat().reduce((cv, v) => {
        if (v !== null && v !== void 0) {
          const type = typeof v;
          if (type === "string" || type === "number") {
            cv.push(v);
          } else if (type === "object") {
            const _cv = Array.isArray(v) ? computedStyles(rule, v) : Object.entries(v).map(([_k, _v]) => rule === "style" && (!!_v || _v === 0) ? `${_k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${_v}` : !!_v ? _k : void 0);
            cv = _cv.length ? cv.concat(_cv.filter((c) => !!c)) : cv;
          }
        }
        return cv;
      }, styles);
    };
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        const matchedEvent = key.match(/^on(.+)/);
        if (matchedEvent) {
          element.addEventListener(matchedEvent[1].toLowerCase(), value);
        } else if (key === "p-bind" || key === "pBind") {
          setAttributes(element, value);
        } else {
          value = key === "class" ? [...new Set(computedStyles("class", value))].join(" ").trim() : key === "style" ? computedStyles("style", value).join(";").trim() : value;
          (element.$attrs = element.$attrs || {}) && (element.$attrs[key] = value);
          element.setAttribute(key, value);
        }
      }
    });
  }
}
function fadeIn(element, duration) {
  if (element) {
    element.style.opacity = "0";
    let last3 = +/* @__PURE__ */ new Date();
    let opacity = "0";
    let tick = function() {
      opacity = `${+element.style.opacity + ((/* @__PURE__ */ new Date()).getTime() - last3) / duration}`;
      element.style.opacity = opacity;
      last3 = +/* @__PURE__ */ new Date();
      if (+opacity < 1) {
        !!window.requestAnimationFrame && requestAnimationFrame(tick) || setTimeout(tick, 16);
      }
    };
    tick();
  }
}
function find(element, selector) {
  return isElement(element) ? Array.from(element.querySelectorAll(selector)) : [];
}
function findSingle(element, selector) {
  return isElement(element) ? element.matches(selector) ? element : element.querySelector(selector) : null;
}
function focus(element, options) {
  element && document.activeElement !== element && element.focus(options);
}
function getFocusableElements(element, selector = "") {
  let focusableElements = find(element, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector}`);
  let visibleFocusableElements = [];
  for (let focusableElement of focusableElements) {
    if (getComputedStyle(focusableElement).display != "none" && getComputedStyle(focusableElement).visibility != "hidden") visibleFocusableElements.push(focusableElement);
  }
  return visibleFocusableElements;
}
function getFirstFocusableElement(element, selector) {
  const focusableElements = getFocusableElements(element, selector);
  return focusableElements.length > 0 ? focusableElements[0] : null;
}
function getHeight(element) {
  if (element) {
    let height = element.offsetHeight;
    let style2 = getComputedStyle(element);
    height -= parseFloat(style2.paddingTop) + parseFloat(style2.paddingBottom) + parseFloat(style2.borderTopWidth) + parseFloat(style2.borderBottomWidth);
    return height;
  }
  return 0;
}
function getParentNode(element) {
  if (element) {
    let parent = element.parentNode;
    if (parent && parent instanceof ShadowRoot && parent.host) {
      parent = parent.host;
    }
    return parent;
  }
  return null;
}
function getIndex(element) {
  var _a;
  if (element) {
    let children = (_a = getParentNode(element)) == null ? void 0 : _a.childNodes;
    let num = 0;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        if (children[i] === element) return num;
        if (children[i].nodeType === 1) num++;
      }
    }
  }
  return -1;
}
function getLastFocusableElement(element, selector) {
  const focusableElements = getFocusableElements(element, selector);
  return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : null;
}
function getOffset(element) {
  if (element) {
    let rect = element.getBoundingClientRect();
    return {
      top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
      left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0)
    };
  }
  return {
    top: "auto",
    left: "auto"
  };
}
function getOuterHeight(element, margin) {
  if (element) {
    let height = element.offsetHeight;
    if (margin) {
      let style2 = getComputedStyle(element);
      height += parseFloat(style2.marginTop) + parseFloat(style2.marginBottom);
    }
    return height;
  }
  return 0;
}
function getSelection() {
  if (window.getSelection) return window.getSelection().toString();
  else if (document.getSelection) return document.getSelection().toString();
  return void 0;
}
function isExist(element) {
  return !!(element !== null && typeof element !== "undefined" && element.nodeName && getParentNode(element));
}
function getTargetElement(target, currentElement) {
  var _a;
  if (!target) return void 0;
  switch (target) {
    case "document":
      return document;
    case "window":
      return window;
    case "body":
      return document.body;
    case "@next":
      return currentElement == null ? void 0 : currentElement.nextElementSibling;
    case "@prev":
      return currentElement == null ? void 0 : currentElement.previousElementSibling;
    case "@parent":
      return currentElement == null ? void 0 : currentElement.parentElement;
    case "@grandparent":
      return (_a = currentElement == null ? void 0 : currentElement.parentElement) == null ? void 0 : _a.parentElement;
    default:
      if (typeof target === "string") {
        return document.querySelector(target);
      }
      const isFunction3 = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
      const element = toElement(isFunction3(target) ? target() : target);
      return (element == null ? void 0 : element.nodeType) === 9 || isExist(element) ? element : void 0;
  }
}
function getWidth(element) {
  if (element) {
    let width = element.offsetWidth;
    let style2 = getComputedStyle(element);
    width -= parseFloat(style2.paddingLeft) + parseFloat(style2.paddingRight) + parseFloat(style2.borderLeftWidth) + parseFloat(style2.borderRightWidth);
    return width;
  }
  return 0;
}
function isVisible(element) {
  return !!(element && element.offsetParent != null);
}
function isHidden(element) {
  return !isVisible(element);
}
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function remove(element) {
  var _a;
  if (element) {
    if (!("remove" in Element.prototype)) (_a = element.parentNode) == null ? void 0 : _a.removeChild(element);
    else element.remove();
  }
}
function removeChild(element, child) {
  const target = toElement(element);
  if (target) target.removeChild(child);
  else throw new Error("Cannot remove " + child + " from " + element);
}
function scrollInView(container, item) {
  let borderTopValue = getComputedStyle(container).getPropertyValue("borderTopWidth");
  let borderTop = borderTopValue ? parseFloat(borderTopValue) : 0;
  let paddingTopValue = getComputedStyle(container).getPropertyValue("paddingTop");
  let paddingTop = paddingTopValue ? parseFloat(paddingTopValue) : 0;
  let containerRect = container.getBoundingClientRect();
  let itemRect = item.getBoundingClientRect();
  let offset = itemRect.top + document.body.scrollTop - (containerRect.top + document.body.scrollTop) - borderTop - paddingTop;
  let scroll = container.scrollTop;
  let elementHeight = container.clientHeight;
  let itemHeight = getOuterHeight(item);
  if (offset < 0) {
    container.scrollTop = scroll + offset;
  } else if (offset + itemHeight > elementHeight) {
    container.scrollTop = scroll + offset - elementHeight + itemHeight;
  }
}
function setAttribute(element, attribute = "", value) {
  if (isElement(element) && value !== null && value !== void 0) {
    element.setAttribute(attribute, value);
  }
}
var init_dom = __esm({
  "node_modules/@primeuix/utils/dom/index.mjs"() {
    "use strict";
  }
});

// node_modules/@primeuix/utils/eventbus/index.mjs
function EventBus() {
  const allHandlers = /* @__PURE__ */ new Map();
  return {
    on(type, handler2) {
      let handlers = allHandlers.get(type);
      if (!handlers) handlers = [handler2];
      else handlers.push(handler2);
      allHandlers.set(type, handlers);
      return this;
    },
    off(type, handler2) {
      let handlers = allHandlers.get(type);
      if (handlers) {
        handlers.splice(handlers.indexOf(handler2) >>> 0, 1);
      }
      return this;
    },
    emit(type, evt) {
      let handlers = allHandlers.get(type);
      if (handlers) {
        handlers.slice().map((handler2) => {
          handler2(evt);
        });
      }
    },
    clear() {
      allHandlers.clear();
    }
  };
}
var init_eventbus = __esm({
  "node_modules/@primeuix/utils/eventbus/index.mjs"() {
    "use strict";
  }
});

// node_modules/@primeuix/utils/mergeprops/index.mjs
var init_mergeprops = __esm({
  "node_modules/@primeuix/utils/mergeprops/index.mjs"() {
    "use strict";
  }
});

// node_modules/@primeuix/utils/object/index.mjs
function isEmpty(value) {
  return value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0 || !(value instanceof Date) && typeof value === "object" && Object.keys(value).length === 0;
}
function _deepEquals(obj1, obj2, visited = /* @__PURE__ */ new WeakSet()) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  if (visited.has(obj1) || visited.has(obj2)) return false;
  visited.add(obj1).add(obj2);
  let arrObj1 = Array.isArray(obj1), arrObj2 = Array.isArray(obj2), i, length, key;
  if (arrObj1 && arrObj2) {
    length = obj1.length;
    if (length != obj2.length) return false;
    for (i = length; i-- !== 0; ) if (!_deepEquals(obj1[i], obj2[i], visited)) return false;
    return true;
  }
  if (arrObj1 != arrObj2) return false;
  let dateObj1 = obj1 instanceof Date, dateObj2 = obj2 instanceof Date;
  if (dateObj1 != dateObj2) return false;
  if (dateObj1 && dateObj2) return obj1.getTime() == obj2.getTime();
  let regexpObj1 = obj1 instanceof RegExp, regexpObj2 = obj2 instanceof RegExp;
  if (regexpObj1 != regexpObj2) return false;
  if (regexpObj1 && regexpObj2) return obj1.toString() == obj2.toString();
  let keys = Object.keys(obj1);
  length = keys.length;
  if (length !== Object.keys(obj2).length) return false;
  for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(obj2, keys[i])) return false;
  for (i = length; i-- !== 0; ) {
    key = keys[i];
    if (!_deepEquals(obj1[key], obj2[key], visited)) return false;
  }
  return true;
}
function deepEquals(obj1, obj2) {
  return _deepEquals(obj1, obj2);
}
function isFunction2(value) {
  return !!(value && value.constructor && value.call && value.apply);
}
function isNotEmpty(value) {
  return !isEmpty(value);
}
function resolveFieldData(data, field) {
  if (!data || !field) {
    return null;
  }
  try {
    const value = data[field];
    if (isNotEmpty(value)) return value;
  } catch (e) {
  }
  if (Object.keys(data).length) {
    if (isFunction2(field)) {
      return field(data);
    } else if (field.indexOf(".") === -1) {
      return data[field];
    } else {
      let fields = field.split(".");
      let value = data;
      for (let i = 0, len = fields.length; i < len; ++i) {
        if (value == null) {
          return null;
        }
        value = value[fields[i]];
      }
      return value;
    }
  }
  return null;
}
function equals(obj1, obj2, field) {
  if (field) return resolveFieldData(obj1, field) === resolveFieldData(obj2, field);
  else return deepEquals(obj1, obj2);
}
function contains(value, list) {
  if (value != null && list && list.length) {
    for (let val of list) {
      if (equals(value, val)) return true;
    }
  }
  return false;
}
function findLastIndex(arr, callback) {
  let index = -1;
  if (isNotEmpty(arr)) {
    try {
      index = arr.findLastIndex(callback);
    } catch (e) {
      index = arr.lastIndexOf([...arr].reverse().find(callback));
    }
  }
  return index;
}
function isObject(value, empty = true) {
  return value instanceof Object && value.constructor === Object && (empty || Object.keys(value).length !== 0);
}
function resolve(obj, ...params) {
  return isFunction2(obj) ? obj(...params) : obj;
}
function isString(value, empty = true) {
  return typeof value === "string" && (empty || value !== "");
}
function toFlatCase(str) {
  return isString(str) ? str.replace(/(-|_)/g, "").toLowerCase() : str;
}
function getKeyValue(obj, key = "", params = {}) {
  const fKeys = toFlatCase(key).split(".");
  const fKey = fKeys.shift();
  return fKey ? isObject(obj) ? getKeyValue(resolve(obj[Object.keys(obj).find((k) => toFlatCase(k) === fKey) || ""], params), fKeys.join("."), params) : void 0 : resolve(obj, params);
}
function isArray(value, empty = true) {
  return Array.isArray(value) && (empty || value.length !== 0);
}
function isDate(value) {
  return value instanceof Date && value.constructor === Date;
}
function isNumber(value) {
  return isNotEmpty(value) && !isNaN(value);
}
function isPrintableCharacter(char = "") {
  return isNotEmpty(char) && char.length === 1 && !!char.match(/\S| /);
}
function matchRegex(str, regex) {
  if (regex) {
    const match2 = regex.test(str);
    regex.lastIndex = 0;
    return match2;
  }
  return false;
}
function minifyCSS(css3) {
  return css3 ? css3.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":") : css3;
}
function removeAccents(str) {
  const accentCheckRegex = /[\xC0-\xFF\u0100-\u017E]/;
  if (str && accentCheckRegex.test(str)) {
    const accentsMap = {
      A: /[\xC0-\xC5\u0100\u0102\u0104]/g,
      AE: /[\xC6]/g,
      C: /[\xC7\u0106\u0108\u010A\u010C]/g,
      D: /[\xD0\u010E\u0110]/g,
      E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g,
      G: /[\u011C\u011E\u0120\u0122]/g,
      H: /[\u0124\u0126]/g,
      I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g,
      IJ: /[\u0132]/g,
      J: /[\u0134]/g,
      K: /[\u0136]/g,
      L: /[\u0139\u013B\u013D\u013F\u0141]/g,
      N: /[\xD1\u0143\u0145\u0147\u014A]/g,
      O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g,
      OE: /[\u0152]/g,
      R: /[\u0154\u0156\u0158]/g,
      S: /[\u015A\u015C\u015E\u0160]/g,
      T: /[\u0162\u0164\u0166]/g,
      U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g,
      W: /[\u0174]/g,
      Y: /[\xDD\u0176\u0178]/g,
      Z: /[\u0179\u017B\u017D]/g,
      a: /[\xE0-\xE5\u0101\u0103\u0105]/g,
      ae: /[\xE6]/g,
      c: /[\xE7\u0107\u0109\u010B\u010D]/g,
      d: /[\u010F\u0111]/g,
      e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g,
      g: /[\u011D\u011F\u0121\u0123]/g,
      i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g,
      ij: /[\u0133]/g,
      j: /[\u0135]/g,
      k: /[\u0137,\u0138]/g,
      l: /[\u013A\u013C\u013E\u0140\u0142]/g,
      n: /[\xF1\u0144\u0146\u0148\u014B]/g,
      p: /[\xFE]/g,
      o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g,
      oe: /[\u0153]/g,
      r: /[\u0155\u0157\u0159]/g,
      s: /[\u015B\u015D\u015F\u0161]/g,
      t: /[\u0163\u0165\u0167]/g,
      u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g,
      w: /[\u0175]/g,
      y: /[\xFD\xFF\u0177]/g,
      z: /[\u017A\u017C\u017E]/g
    };
    for (let key in accentsMap) {
      str = str.replace(accentsMap[key], key);
    }
  }
  return str;
}
function toKebabCase(str) {
  return isString(str) ? str.replace(/(_)/g, "-").replace(/[A-Z]/g, (c, i) => i === 0 ? c : "-" + c.toLowerCase()).toLowerCase() : str;
}
function toTokenKey(str) {
  return isString(str) ? str.replace(/[A-Z]/g, (c, i) => i === 0 ? c : "." + c.toLowerCase()).toLowerCase() : str;
}
var init_object = __esm({
  "node_modules/@primeuix/utils/object/index.mjs"() {
    "use strict";
  }
});

// node_modules/@primeuix/utils/uuid/index.mjs
function uuid(prefix = "pui_id_") {
  if (!lastIds.hasOwnProperty(prefix)) {
    lastIds[prefix] = 0;
  }
  lastIds[prefix]++;
  return `${prefix}${lastIds[prefix]}`;
}
var lastIds;
var init_uuid = __esm({
  "node_modules/@primeuix/utils/uuid/index.mjs"() {
    "use strict";
    lastIds = {};
  }
});

// node_modules/@primeuix/utils/zindex/index.mjs
function handler() {
  let zIndexes = [];
  const generateZIndex = (key, autoZIndex, baseZIndex = 999) => {
    const lastZIndex = getLastZIndex(key, autoZIndex, baseZIndex);
    const newZIndex = lastZIndex.value + (lastZIndex.key === key ? 0 : baseZIndex) + 1;
    zIndexes.push({
      key,
      value: newZIndex
    });
    return newZIndex;
  };
  const revertZIndex = (zIndex) => {
    zIndexes = zIndexes.filter((obj) => obj.value !== zIndex);
  };
  const getCurrentZIndex = (key, autoZIndex) => {
    return getLastZIndex(key, autoZIndex).value;
  };
  const getLastZIndex = (key, autoZIndex, baseZIndex = 0) => {
    return [...zIndexes].reverse().find((obj) => autoZIndex ? true : obj.key === key) || {
      key,
      value: baseZIndex
    };
  };
  const getZIndex = (element) => {
    return element ? parseInt(element.style.zIndex, 10) || 0 : 0;
  };
  return {
    get: getZIndex,
    set: (key, element, baseZIndex) => {
      if (element) {
        element.style.zIndex = String(generateZIndex(key, true, baseZIndex));
      }
    },
    clear: (element) => {
      if (element) {
        revertZIndex(getZIndex(element));
        element.style.zIndex = "";
      }
    },
    getCurrent: (key) => getCurrentZIndex(key, true)
  };
}
var ZIndex;
var init_zindex = __esm({
  "node_modules/@primeuix/utils/zindex/index.mjs"() {
    "use strict";
    ZIndex = handler();
  }
});

// node_modules/@primeuix/utils/index.mjs
var init_utils = __esm({
  "node_modules/@primeuix/utils/index.mjs"() {
    "use strict";
    init_classnames();
    init_dom();
    init_eventbus();
    init_mergeprops();
    init_object();
    init_uuid();
    init_zindex();
  }
});

// node_modules/primeng/fesm2022/primeng-api.mjs
var ConfirmEventType, ConfirmationService, ContextMenuService, FilterMatchMode, FilterOperator, FilterService, MessageService, OverlayService, Header, Footer, PrimeTemplate, SharedModule, TranslationKeys, TreeDragDropService;
var init_primeng_api = __esm({
  "node_modules/primeng/fesm2022/primeng-api.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_esm();
    init_utils();
    init_common();
    (function(ConfirmEventType2) {
      ConfirmEventType2[ConfirmEventType2["ACCEPT"] = 0] = "ACCEPT";
      ConfirmEventType2[ConfirmEventType2["REJECT"] = 1] = "REJECT";
      ConfirmEventType2[ConfirmEventType2["CANCEL"] = 2] = "CANCEL";
    })(ConfirmEventType || (ConfirmEventType = {}));
    ConfirmationService = class _ConfirmationService {
      requireConfirmationSource = new Subject();
      acceptConfirmationSource = new Subject();
      requireConfirmation$ = this.requireConfirmationSource.asObservable();
      accept = this.acceptConfirmationSource.asObservable();
      /**
       * Callback to invoke on confirm.
       * @param {Confirmation} confirmation - Represents a confirmation dialog configuration.
       * @group Method
       */
      confirm(confirmation) {
        this.requireConfirmationSource.next(confirmation);
        return this;
      }
      /**
       * Closes the dialog.
       * @group Method
       */
      close() {
        this.requireConfirmationSource.next(null);
        return this;
      }
      /**
       * Accepts the dialog.
       * @group Method
       */
      onAccept() {
        this.acceptConfirmationSource.next(null);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ConfirmationService,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ConfirmationService
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ConfirmationService,
      decorators: [{
        type: Injectable
      }]
    });
    ContextMenuService = class _ContextMenuService {
      activeItemKeyChange = new Subject();
      activeItemKeyChange$ = this.activeItemKeyChange.asObservable();
      activeItemKey;
      changeKey(key) {
        this.activeItemKey = key;
        this.activeItemKeyChange.next(this.activeItemKey);
      }
      reset() {
        this.activeItemKey = null;
        this.activeItemKeyChange.next(this.activeItemKey);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ContextMenuService,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ContextMenuService
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ContextMenuService,
      decorators: [{
        type: Injectable
      }]
    });
    FilterMatchMode = class {
      static STARTS_WITH = "startsWith";
      static CONTAINS = "contains";
      static NOT_CONTAINS = "notContains";
      static ENDS_WITH = "endsWith";
      static EQUALS = "equals";
      static NOT_EQUALS = "notEquals";
      static IN = "in";
      static LESS_THAN = "lt";
      static LESS_THAN_OR_EQUAL_TO = "lte";
      static GREATER_THAN = "gt";
      static GREATER_THAN_OR_EQUAL_TO = "gte";
      static BETWEEN = "between";
      static IS = "is";
      static IS_NOT = "isNot";
      static BEFORE = "before";
      static AFTER = "after";
      static DATE_IS = "dateIs";
      static DATE_IS_NOT = "dateIsNot";
      static DATE_BEFORE = "dateBefore";
      static DATE_AFTER = "dateAfter";
    };
    FilterOperator = class {
      static AND = "and";
      static OR = "or";
    };
    FilterService = class _FilterService {
      filter(value, fields, filterValue, filterMatchMode, filterLocale) {
        let filteredItems = [];
        if (value) {
          for (let item of value) {
            for (let field of fields) {
              let fieldValue = resolveFieldData(item, field);
              if (this.filters[filterMatchMode](fieldValue, filterValue, filterLocale)) {
                filteredItems.push(item);
                break;
              }
            }
          }
        }
        return filteredItems;
      }
      filters = {
        startsWith: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null || filter2.trim() === "") {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          let filterValue = removeAccents(filter2.toString()).toLocaleLowerCase(filterLocale);
          let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
          return stringValue.slice(0, filterValue.length) === filterValue;
        },
        contains: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null || typeof filter2 === "string" && filter2.trim() === "") {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          let filterValue = removeAccents(filter2.toString()).toLocaleLowerCase(filterLocale);
          let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
          return stringValue.indexOf(filterValue) !== -1;
        },
        notContains: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null || typeof filter2 === "string" && filter2.trim() === "") {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          let filterValue = removeAccents(filter2.toString()).toLocaleLowerCase(filterLocale);
          let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
          return stringValue.indexOf(filterValue) === -1;
        },
        endsWith: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null || filter2.trim() === "") {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          let filterValue = removeAccents(filter2.toString()).toLocaleLowerCase(filterLocale);
          let stringValue = removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
          return stringValue.indexOf(filterValue, stringValue.length - filterValue.length) !== -1;
        },
        equals: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null || typeof filter2 === "string" && filter2.trim() === "") {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          if (value.getTime && filter2.getTime) return value.getTime() === filter2.getTime();
          else if (value == filter2) return true;
          else return removeAccents(value.toString()).toLocaleLowerCase(filterLocale) == removeAccents(filter2.toString()).toLocaleLowerCase(filterLocale);
        },
        notEquals: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null || typeof filter2 === "string" && filter2.trim() === "") {
            return false;
          }
          if (value === void 0 || value === null) {
            return true;
          }
          if (value.getTime && filter2.getTime) return value.getTime() !== filter2.getTime();
          else if (value == filter2) return false;
          else return removeAccents(value.toString()).toLocaleLowerCase(filterLocale) != removeAccents(filter2.toString()).toLocaleLowerCase(filterLocale);
        },
        in: (value, filter2) => {
          if (filter2 === void 0 || filter2 === null || filter2.length === 0) {
            return true;
          }
          for (let i = 0; i < filter2.length; i++) {
            if (equals(value, filter2[i])) {
              return true;
            }
          }
          return false;
        },
        between: (value, filter2) => {
          if (filter2 == null || filter2[0] == null || filter2[1] == null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          if (value.getTime) return filter2[0].getTime() <= value.getTime() && value.getTime() <= filter2[1].getTime();
          else return filter2[0] <= value && value <= filter2[1];
        },
        lt: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          if (value.getTime && filter2.getTime) return value.getTime() < filter2.getTime();
          else return value < filter2;
        },
        lte: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          if (value.getTime && filter2.getTime) return value.getTime() <= filter2.getTime();
          else return value <= filter2;
        },
        gt: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          if (value.getTime && filter2.getTime) return value.getTime() > filter2.getTime();
          else return value > filter2;
        },
        gte: (value, filter2, filterLocale) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          if (value.getTime && filter2.getTime) return value.getTime() >= filter2.getTime();
          else return value >= filter2;
        },
        is: (value, filter2, filterLocale) => {
          return this.filters.equals(value, filter2, filterLocale);
        },
        isNot: (value, filter2, filterLocale) => {
          return this.filters.notEquals(value, filter2, filterLocale);
        },
        before: (value, filter2, filterLocale) => {
          return this.filters.lt(value, filter2, filterLocale);
        },
        after: (value, filter2, filterLocale) => {
          return this.filters.gt(value, filter2, filterLocale);
        },
        dateIs: (value, filter2) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          return value.toDateString() === filter2.toDateString();
        },
        dateIsNot: (value, filter2) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          return value.toDateString() !== filter2.toDateString();
        },
        dateBefore: (value, filter2) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          return value.getTime() < filter2.getTime();
        },
        dateAfter: (value, filter2) => {
          if (filter2 === void 0 || filter2 === null) {
            return true;
          }
          if (value === void 0 || value === null) {
            return false;
          }
          value.setHours(0, 0, 0, 0);
          return value.getTime() > filter2.getTime();
        }
      };
      register(rule, fn) {
        this.filters[rule] = fn;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _FilterService,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _FilterService,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: FilterService,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    MessageService = class _MessageService {
      messageSource = new Subject();
      clearSource = new Subject();
      messageObserver = this.messageSource.asObservable();
      clearObserver = this.clearSource.asObservable();
      /**
       * Inserts single message.
       * @param {ToastMessageOptions} message - Message to be added.
       * @group Method
       */
      add(message) {
        if (message) {
          this.messageSource.next(message);
        }
      }
      /**
       * Inserts new messages.
       * @param {Message[]} messages - Messages to be added.
       * @group Method
       */
      addAll(messages) {
        if (messages && messages.length) {
          this.messageSource.next(messages);
        }
      }
      /**
       * Clears the message with the given key.
       * @param {string} key - Key of the message to be cleared.
       * @group Method
       */
      clear(key) {
        this.clearSource.next(key || null);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _MessageService,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _MessageService
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: MessageService,
      decorators: [{
        type: Injectable
      }]
    });
    OverlayService = class _OverlayService {
      clickSource = new Subject();
      clickObservable = this.clickSource.asObservable();
      add(event) {
        if (event) {
          this.clickSource.next(event);
        }
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _OverlayService,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _OverlayService,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: OverlayService,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    Header = class _Header {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _Header,
        deps: [],
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _Header,
        isStandalone: false,
        selector: "p-header",
        ngImport: core_exports,
        template: "<ng-content></ng-content>",
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: Header,
      decorators: [{
        type: Component,
        args: [{
          selector: "p-header",
          template: "<ng-content></ng-content>",
          standalone: false
        }]
      }]
    });
    Footer = class _Footer {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _Footer,
        deps: [],
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _Footer,
        isStandalone: false,
        selector: "p-footer",
        ngImport: core_exports,
        template: "<ng-content></ng-content>",
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: Footer,
      decorators: [{
        type: Component,
        args: [{
          selector: "p-footer",
          template: "<ng-content></ng-content>",
          standalone: false
        }]
      }]
    });
    PrimeTemplate = class _PrimeTemplate {
      template;
      type;
      name;
      constructor(template) {
        this.template = template;
      }
      getType() {
        return this.name;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _PrimeTemplate,
        deps: [{
          token: TemplateRef
        }],
        target: FactoryTarget.Directive
      });
      static \u0275dir = \u0275\u0275ngDeclareDirective({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _PrimeTemplate,
        isStandalone: true,
        selector: "[pTemplate]",
        inputs: {
          type: "type",
          name: ["pTemplate", "name"]
        },
        ngImport: core_exports
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: PrimeTemplate,
      decorators: [{
        type: Directive,
        args: [{
          selector: "[pTemplate]",
          standalone: true
        }]
      }],
      ctorParameters: () => [{
        type: TemplateRef
      }],
      propDecorators: {
        type: [{
          type: Input
        }],
        name: [{
          type: Input,
          args: ["pTemplate"]
        }]
      }
    });
    SharedModule = class _SharedModule {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SharedModule,
        deps: [],
        target: FactoryTarget.NgModule
      });
      static \u0275mod = \u0275\u0275ngDeclareNgModule({
        minVersion: "14.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SharedModule,
        declarations: [Header, Footer],
        imports: [CommonModule, PrimeTemplate],
        exports: [Header, Footer, PrimeTemplate]
      });
      static \u0275inj = \u0275\u0275ngDeclareInjector({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SharedModule,
        imports: [CommonModule]
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SharedModule,
      decorators: [{
        type: NgModule,
        args: [{
          imports: [CommonModule, PrimeTemplate],
          exports: [Header, Footer, PrimeTemplate],
          declarations: [Header, Footer]
        }]
      }]
    });
    TranslationKeys = class {
      static STARTS_WITH = "startsWith";
      static CONTAINS = "contains";
      static NOT_CONTAINS = "notContains";
      static ENDS_WITH = "endsWith";
      static EQUALS = "equals";
      static NOT_EQUALS = "notEquals";
      static NO_FILTER = "noFilter";
      static LT = "lt";
      static LTE = "lte";
      static GT = "gt";
      static GTE = "gte";
      static IS = "is";
      static IS_NOT = "isNot";
      static BEFORE = "before";
      static AFTER = "after";
      static CLEAR = "clear";
      static APPLY = "apply";
      static MATCH_ALL = "matchAll";
      static MATCH_ANY = "matchAny";
      static ADD_RULE = "addRule";
      static REMOVE_RULE = "removeRule";
      static ACCEPT = "accept";
      static REJECT = "reject";
      static CHOOSE = "choose";
      static UPLOAD = "upload";
      static CANCEL = "cancel";
      static PENDING = "pending";
      static FILE_SIZE_TYPES = "fileSizeTypes";
      static DAY_NAMES = "dayNames";
      static DAY_NAMES_SHORT = "dayNamesShort";
      static DAY_NAMES_MIN = "dayNamesMin";
      static MONTH_NAMES = "monthNames";
      static MONTH_NAMES_SHORT = "monthNamesShort";
      static FIRST_DAY_OF_WEEK = "firstDayOfWeek";
      static TODAY = "today";
      static WEEK_HEADER = "weekHeader";
      static WEAK = "weak";
      static MEDIUM = "medium";
      static STRONG = "strong";
      static PASSWORD_PROMPT = "passwordPrompt";
      static EMPTY_MESSAGE = "emptyMessage";
      static EMPTY_FILTER_MESSAGE = "emptyFilterMessage";
      static SHOW_FILTER_MENU = "showFilterMenu";
      static HIDE_FILTER_MENU = "hideFilterMenu";
      static SELECTION_MESSAGE = "selectionMessage";
      static ARIA = "aria";
      static SELECT_COLOR = "selectColor";
      static BROWSE_FILES = "browseFiles";
    };
    TreeDragDropService = class _TreeDragDropService {
      dragStartSource = new Subject();
      dragStopSource = new Subject();
      dragStart$ = this.dragStartSource.asObservable();
      dragStop$ = this.dragStopSource.asObservable();
      startDrag(event) {
        this.dragStartSource.next(event);
      }
      stopDrag(event) {
        this.dragStopSource.next(event);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _TreeDragDropService,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _TreeDragDropService
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: TreeDragDropService,
      decorators: [{
        type: Injectable
      }]
    });
  }
});

// node_modules/@angular/animations/fesm2022/private_export-faY_wCkZ.mjs
function trigger(name, definitions) {
  return {
    type: AnimationMetadataType.Trigger,
    name,
    definitions,
    options: {}
  };
}
function animate(timings, styles = null) {
  return {
    type: AnimationMetadataType.Animate,
    styles,
    timings
  };
}
function sequence(steps, options = null) {
  return {
    type: AnimationMetadataType.Sequence,
    steps,
    options
  };
}
function style(tokens) {
  return {
    type: AnimationMetadataType.Style,
    styles: tokens,
    offset: null
  };
}
function state(name, styles, options) {
  return {
    type: AnimationMetadataType.State,
    name,
    styles,
    options
  };
}
function transition(stateChangeExpr, steps, options = null) {
  return {
    type: AnimationMetadataType.Transition,
    expr: stateChangeExpr,
    animation: steps,
    options
  };
}
function animation(steps, options = null) {
  return {
    type: AnimationMetadataType.Reference,
    animation: steps,
    options
  };
}
function animateChild(options = null) {
  return {
    type: AnimationMetadataType.AnimateChild,
    options
  };
}
function useAnimation(animation2, options = null) {
  return {
    type: AnimationMetadataType.AnimateRef,
    animation: animation2,
    options
  };
}
function query(selector, animation2, options = null) {
  return {
    type: AnimationMetadataType.Query,
    selector,
    animation: animation2,
    options
  };
}
var AnimationMetadataType;
var init_private_export_faY_wCkZ = __esm({
  "node_modules/@angular/animations/fesm2022/private_export-faY_wCkZ.mjs"() {
    "use strict";
    (function(AnimationMetadataType2) {
      AnimationMetadataType2[AnimationMetadataType2["State"] = 0] = "State";
      AnimationMetadataType2[AnimationMetadataType2["Transition"] = 1] = "Transition";
      AnimationMetadataType2[AnimationMetadataType2["Sequence"] = 2] = "Sequence";
      AnimationMetadataType2[AnimationMetadataType2["Group"] = 3] = "Group";
      AnimationMetadataType2[AnimationMetadataType2["Animate"] = 4] = "Animate";
      AnimationMetadataType2[AnimationMetadataType2["Keyframes"] = 5] = "Keyframes";
      AnimationMetadataType2[AnimationMetadataType2["Style"] = 6] = "Style";
      AnimationMetadataType2[AnimationMetadataType2["Trigger"] = 7] = "Trigger";
      AnimationMetadataType2[AnimationMetadataType2["Reference"] = 8] = "Reference";
      AnimationMetadataType2[AnimationMetadataType2["AnimateChild"] = 9] = "AnimateChild";
      AnimationMetadataType2[AnimationMetadataType2["AnimateRef"] = 10] = "AnimateRef";
      AnimationMetadataType2[AnimationMetadataType2["Query"] = 11] = "Query";
      AnimationMetadataType2[AnimationMetadataType2["Stagger"] = 12] = "Stagger";
    })(AnimationMetadataType || (AnimationMetadataType = {}));
  }
});

// node_modules/@angular/animations/fesm2022/animations.mjs
function issueAnimationCommand(renderer, element, id, command, args) {
  renderer.setProperty(element, `@@${id}:${command}`, args);
}
function unwrapAnimationRenderer(renderer) {
  const type = renderer.\u0275type;
  if (type === 0) {
    return renderer;
  } else if (type === 1) {
    return renderer.animationRenderer;
  }
  return null;
}
function isAnimationRenderer(renderer) {
  const type = renderer.\u0275type;
  return type === 0 || type === 1;
}
var AnimationBuilder, AnimationFactory, BrowserAnimationBuilder, BrowserAnimationFactory, RendererAnimationPlayer;
var init_animations = __esm({
  "node_modules/@angular/animations/fesm2022/animations.mjs"() {
    "use strict";
    init_common();
    init_core();
    init_core();
    init_private_export_faY_wCkZ();
    init_private_export_faY_wCkZ();
    AnimationBuilder = class _AnimationBuilder {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _AnimationBuilder,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _AnimationBuilder,
        providedIn: "root",
        useFactory: () => inject(BrowserAnimationBuilder)
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: AnimationBuilder,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root",
          useFactory: () => inject(BrowserAnimationBuilder)
        }]
      }]
    });
    AnimationFactory = class {
    };
    BrowserAnimationBuilder = class _BrowserAnimationBuilder extends AnimationBuilder {
      animationModuleType = inject(ANIMATION_MODULE_TYPE, {
        optional: true
      });
      _nextAnimationId = 0;
      _renderer;
      constructor(rootRenderer, doc) {
        super();
        const typeData = {
          id: "0",
          encapsulation: ViewEncapsulation.None,
          styles: [],
          data: {
            animation: []
          }
        };
        this._renderer = rootRenderer.createRenderer(doc.body, typeData);
        if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
          throw new RuntimeError(3600, (typeof ngDevMode === "undefined" || ngDevMode) && "Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.");
        }
      }
      build(animation2) {
        const id = this._nextAnimationId;
        this._nextAnimationId++;
        const entry = Array.isArray(animation2) ? sequence(animation2) : animation2;
        issueAnimationCommand(this._renderer, null, id, "register", [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _BrowserAnimationBuilder,
        deps: [{
          token: RendererFactory2
        }, {
          token: DOCUMENT
        }],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.14",
        ngImport: core_exports,
        type: _BrowserAnimationBuilder,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.14",
      ngImport: core_exports,
      type: BrowserAnimationBuilder,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }],
      ctorParameters: () => [{
        type: RendererFactory2
      }, {
        type: Document,
        decorators: [{
          type: Inject,
          args: [DOCUMENT]
        }]
      }]
    });
    BrowserAnimationFactory = class extends AnimationFactory {
      _id;
      _renderer;
      constructor(_id2, _renderer) {
        super();
        this._id = _id2;
        this._renderer = _renderer;
      }
      create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
      }
    };
    RendererAnimationPlayer = class {
      id;
      element;
      _renderer;
      parentPlayer = null;
      _started = false;
      constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this._command("create", options);
      }
      _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
      }
      _command(command, ...args) {
        issueAnimationCommand(this._renderer, this.element, this.id, command, args);
      }
      onDone(fn) {
        this._listen("done", fn);
      }
      onStart(fn) {
        this._listen("start", fn);
      }
      onDestroy(fn) {
        this._listen("destroy", fn);
      }
      init() {
        this._command("init");
      }
      hasStarted() {
        return this._started;
      }
      play() {
        this._command("play");
        this._started = true;
      }
      pause() {
        this._command("pause");
      }
      restart() {
        this._command("restart");
      }
      finish() {
        this._command("finish");
      }
      destroy() {
        this._command("destroy");
      }
      reset() {
        this._command("reset");
        this._started = false;
      }
      setPosition(p) {
        this._command("setPosition", p);
      }
      getPosition() {
        return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
      }
      totalTime = 0;
    };
  }
});

// node_modules/@primeuix/styled/index.mjs
function merge(value1, value2) {
  if (isArray(value1)) {
    value1.push(...value2 || []);
  } else if (isObject(value1)) {
    Object.assign(value1, value2);
  }
}
function toValue(value) {
  return isObject(value) && value.hasOwnProperty("value") && value.hasOwnProperty("type") ? value.value : value;
}
function toNormalizePrefix(prefix) {
  return prefix.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function toNormalizeVariable(prefix = "", variable = "") {
  return toNormalizePrefix(`${isString(prefix, false) && isString(variable, false) ? `${prefix}-` : prefix}${variable}`);
}
function getVariableName(prefix = "", variable = "") {
  return `--${toNormalizeVariable(prefix, variable)}`;
}
function hasOddBraces(str = "") {
  const openBraces = (str.match(/{/g) || []).length;
  const closeBraces = (str.match(/}/g) || []).length;
  return (openBraces + closeBraces) % 2 !== 0;
}
function getVariableValue(value, variable = "", prefix = "", excludedKeyRegexes = [], fallback) {
  if (isString(value)) {
    const regex = /{([^}]*)}/g;
    const val = value.trim();
    if (hasOddBraces(val)) {
      return void 0;
    } else if (matchRegex(val, regex)) {
      const _val = val.replaceAll(regex, (v) => {
        const path = v.replace(/{|}/g, "");
        const keys = path.split(".").filter((_v) => !excludedKeyRegexes.some((_r) => matchRegex(_v, _r)));
        return `var(${getVariableName(prefix, toKebabCase(keys.join("-")))}${isNotEmpty(fallback) ? `, ${fallback}` : ""})`;
      });
      const calculationRegex = /(\d+\s+[\+\-\*\/]\s+\d+)/g;
      const cleanedVarRegex = /var\([^)]+\)/g;
      return matchRegex(_val.replace(cleanedVarRegex, "0"), calculationRegex) ? `calc(${_val})` : _val;
    }
    return val;
  } else if (isNumber(value)) {
    return value;
  }
  return void 0;
}
function setProperty(properties, key, value) {
  if (isString(key, false)) {
    properties.push(`${key}:${value};`);
  }
}
function getRule(selector, properties) {
  if (selector) {
    return `${selector}{${properties}}`;
  }
  return "";
}
function toVariables_default(theme3, options = {}) {
  const VARIABLE = config_default.defaults.variable;
  const {
    prefix = VARIABLE.prefix,
    selector = VARIABLE.selector,
    excludedKeyRegex = VARIABLE.excludedKeyRegex
  } = options;
  const _toVariables = (_theme, _prefix = "") => {
    return Object.entries(_theme).reduce((acc, [key, value]) => {
      const px = matchRegex(key, excludedKeyRegex) ? toNormalizeVariable(_prefix) : toNormalizeVariable(_prefix, toKebabCase(key));
      const v = toValue(value);
      if (isObject(v)) {
        const {
          variables: variables2,
          tokens: tokens2
        } = _toVariables(v, px);
        merge(acc["tokens"], tokens2);
        merge(acc["variables"], variables2);
      } else {
        acc["tokens"].push((prefix ? px.replace(`${prefix}-`, "") : px).replaceAll("-", "."));
        setProperty(acc["variables"], getVariableName(px), getVariableValue(v, px, prefix, [excludedKeyRegex]));
      }
      return acc;
    }, {
      variables: [],
      tokens: []
    });
  };
  const {
    variables,
    tokens
  } = _toVariables(theme3, prefix);
  return {
    value: variables,
    tokens,
    declarations: variables.join(""),
    css: getRule(selector, variables.join(""))
  };
}
var __defProp, __defProps, __getOwnPropDescs, __getOwnPropSymbols, __hasOwnProp, __propIsEnum, __defNormalProp, __spreadValues2, __spreadProps2, __objRest, ThemeService, service_default, dt, dtwt, themeUtils_default, config_default;
var init_styled = __esm({
  "node_modules/@primeuix/styled/index.mjs"() {
    "use strict";
    init_object();
    init_object();
    init_eventbus();
    init_object();
    init_object();
    init_object();
    init_object();
    init_object();
    init_object();
    init_object();
    __defProp = Object.defineProperty;
    __defProps = Object.defineProperties;
    __getOwnPropDescs = Object.getOwnPropertyDescriptors;
    __getOwnPropSymbols = Object.getOwnPropertySymbols;
    __hasOwnProp = Object.prototype.hasOwnProperty;
    __propIsEnum = Object.prototype.propertyIsEnumerable;
    __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
      enumerable: true,
      configurable: true,
      writable: true,
      value
    }) : obj[key] = value;
    __spreadValues2 = (a, b) => {
      for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
      if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
      }
      return a;
    };
    __spreadProps2 = (a, b) => __defProps(a, __getOwnPropDescs(b));
    __objRest = (source, exclude) => {
      var target = {};
      for (var prop in source) if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0) target[prop] = source[prop];
      if (source != null && __getOwnPropSymbols) for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop)) target[prop] = source[prop];
      }
      return target;
    };
    ThemeService = EventBus();
    service_default = ThemeService;
    dt = (...args) => {
      return dtwt(config_default.getTheme(), ...args);
    };
    dtwt = (theme3 = {}, tokenPath, fallback, type) => {
      if (tokenPath) {
        const {
          variable: VARIABLE,
          options: OPTIONS
        } = config_default.defaults || {};
        const {
          prefix,
          transform
        } = (theme3 == null ? void 0 : theme3.options) || OPTIONS || {};
        const regex = /{([^}]*)}/g;
        const token = matchRegex(tokenPath, regex) ? tokenPath : `{${tokenPath}}`;
        const isStrictTransform = type === "value" || isEmpty(type) && transform === "strict";
        return isStrictTransform ? config_default.getTokenValue(tokenPath) : getVariableValue(token, void 0, prefix, [VARIABLE.excludedKeyRegex], fallback);
      }
      return "";
    };
    themeUtils_default = {
      regex: {
        rules: {
          class: {
            pattern: /^\.([a-zA-Z][\w-]*)$/,
            resolve(value) {
              return {
                type: "class",
                selector: value,
                matched: this.pattern.test(value.trim())
              };
            }
          },
          attr: {
            pattern: /^\[(.*)\]$/,
            resolve(value) {
              return {
                type: "attr",
                selector: `:root${value}`,
                matched: this.pattern.test(value.trim())
              };
            }
          },
          media: {
            pattern: /^@media (.*)$/,
            resolve(value) {
              return {
                type: "media",
                selector: `${value}{:root{[CSS]}}`,
                matched: this.pattern.test(value.trim())
              };
            }
          },
          system: {
            pattern: /^system$/,
            resolve(value) {
              return {
                type: "system",
                selector: "@media (prefers-color-scheme: dark){:root{[CSS]}}",
                matched: this.pattern.test(value.trim())
              };
            }
          },
          custom: {
            resolve(value) {
              return {
                type: "custom",
                selector: value,
                matched: true
              };
            }
          }
        },
        resolve(value) {
          const rules = Object.keys(this.rules).filter((k) => k !== "custom").map((r) => this.rules[r]);
          return [value].flat().map((v) => {
            var _a;
            return (_a = rules.map((r) => r.resolve(v)).find((rr) => rr.matched)) != null ? _a : this.rules.custom.resolve(v);
          });
        }
      },
      _toVariables(theme3, options) {
        return toVariables_default(theme3, {
          prefix: options == null ? void 0 : options.prefix
        });
      },
      getCommon({
        name = "",
        theme: theme3 = {},
        params,
        set,
        defaults
      }) {
        var _e, _f, _g, _h, _i, _j, _k;
        const {
          preset,
          options
        } = theme3;
        let primitive_css, primitive_tokens, semantic_css, semantic_tokens, global_css, global_tokens, style2;
        if (isNotEmpty(preset) && options.transform !== "strict") {
          const {
            primitive,
            semantic,
            extend
          } = preset;
          const _a = semantic || {}, {
            colorScheme
          } = _a, sRest = __objRest(_a, ["colorScheme"]);
          const _b = extend || {}, {
            colorScheme: eColorScheme
          } = _b, eRest = __objRest(_b, ["colorScheme"]);
          const _c = colorScheme || {}, {
            dark
          } = _c, csRest = __objRest(_c, ["dark"]);
          const _d = eColorScheme || {}, {
            dark: eDark
          } = _d, ecsRest = __objRest(_d, ["dark"]);
          const prim_var = isNotEmpty(primitive) ? this._toVariables({
            primitive
          }, options) : {};
          const sRest_var = isNotEmpty(sRest) ? this._toVariables({
            semantic: sRest
          }, options) : {};
          const csRest_var = isNotEmpty(csRest) ? this._toVariables({
            light: csRest
          }, options) : {};
          const csDark_var = isNotEmpty(dark) ? this._toVariables({
            dark
          }, options) : {};
          const eRest_var = isNotEmpty(eRest) ? this._toVariables({
            semantic: eRest
          }, options) : {};
          const ecsRest_var = isNotEmpty(ecsRest) ? this._toVariables({
            light: ecsRest
          }, options) : {};
          const ecsDark_var = isNotEmpty(eDark) ? this._toVariables({
            dark: eDark
          }, options) : {};
          const [prim_css, prim_tokens] = [(_e = prim_var.declarations) != null ? _e : "", prim_var.tokens];
          const [sRest_css, sRest_tokens] = [(_f = sRest_var.declarations) != null ? _f : "", sRest_var.tokens || []];
          const [csRest_css, csRest_tokens] = [(_g = csRest_var.declarations) != null ? _g : "", csRest_var.tokens || []];
          const [csDark_css, csDark_tokens] = [(_h = csDark_var.declarations) != null ? _h : "", csDark_var.tokens || []];
          const [eRest_css, eRest_tokens] = [(_i = eRest_var.declarations) != null ? _i : "", eRest_var.tokens || []];
          const [ecsRest_css, ecsRest_tokens] = [(_j = ecsRest_var.declarations) != null ? _j : "", ecsRest_var.tokens || []];
          const [ecsDark_css, ecsDark_tokens] = [(_k = ecsDark_var.declarations) != null ? _k : "", ecsDark_var.tokens || []];
          primitive_css = this.transformCSS(name, prim_css, "light", "variable", options, set, defaults);
          primitive_tokens = prim_tokens;
          const semantic_light_css = this.transformCSS(name, `${sRest_css}${csRest_css}`, "light", "variable", options, set, defaults);
          const semantic_dark_css = this.transformCSS(name, `${csDark_css}`, "dark", "variable", options, set, defaults);
          semantic_css = `${semantic_light_css}${semantic_dark_css}`;
          semantic_tokens = [.../* @__PURE__ */ new Set([...sRest_tokens, ...csRest_tokens, ...csDark_tokens])];
          const global_light_css = this.transformCSS(name, `${eRest_css}${ecsRest_css}color-scheme:light`, "light", "variable", options, set, defaults);
          const global_dark_css = this.transformCSS(name, `${ecsDark_css}color-scheme:dark`, "dark", "variable", options, set, defaults);
          global_css = `${global_light_css}${global_dark_css}`;
          global_tokens = [.../* @__PURE__ */ new Set([...eRest_tokens, ...ecsRest_tokens, ...ecsDark_tokens])];
          style2 = resolve(preset.css, {
            dt
          });
        }
        return {
          primitive: {
            css: primitive_css,
            tokens: primitive_tokens
          },
          semantic: {
            css: semantic_css,
            tokens: semantic_tokens
          },
          global: {
            css: global_css,
            tokens: global_tokens
          },
          style: style2
        };
      },
      getPreset({
        name = "",
        preset = {},
        options,
        params,
        set,
        defaults,
        selector
      }) {
        var _e, _f, _g;
        let p_css, p_tokens, p_style;
        if (isNotEmpty(preset) && options.transform !== "strict") {
          const _name = name.replace("-directive", "");
          const _a = preset, {
            colorScheme,
            extend,
            css: css22
          } = _a, vRest = __objRest(_a, ["colorScheme", "extend", "css"]);
          const _b = extend || {}, {
            colorScheme: eColorScheme
          } = _b, evRest = __objRest(_b, ["colorScheme"]);
          const _c = colorScheme || {}, {
            dark
          } = _c, csRest = __objRest(_c, ["dark"]);
          const _d = eColorScheme || {}, {
            dark: ecsDark
          } = _d, ecsRest = __objRest(_d, ["dark"]);
          const vRest_var = isNotEmpty(vRest) ? this._toVariables({
            [_name]: __spreadValues2(__spreadValues2({}, vRest), evRest)
          }, options) : {};
          const csRest_var = isNotEmpty(csRest) ? this._toVariables({
            [_name]: __spreadValues2(__spreadValues2({}, csRest), ecsRest)
          }, options) : {};
          const csDark_var = isNotEmpty(dark) ? this._toVariables({
            [_name]: __spreadValues2(__spreadValues2({}, dark), ecsDark)
          }, options) : {};
          const [vRest_css, vRest_tokens] = [(_e = vRest_var.declarations) != null ? _e : "", vRest_var.tokens || []];
          const [csRest_css, csRest_tokens] = [(_f = csRest_var.declarations) != null ? _f : "", csRest_var.tokens || []];
          const [csDark_css, csDark_tokens] = [(_g = csDark_var.declarations) != null ? _g : "", csDark_var.tokens || []];
          const light_variable_css = this.transformCSS(_name, `${vRest_css}${csRest_css}`, "light", "variable", options, set, defaults, selector);
          const dark_variable_css = this.transformCSS(_name, csDark_css, "dark", "variable", options, set, defaults, selector);
          p_css = `${light_variable_css}${dark_variable_css}`;
          p_tokens = [.../* @__PURE__ */ new Set([...vRest_tokens, ...csRest_tokens, ...csDark_tokens])];
          p_style = resolve(css22, {
            dt
          });
        }
        return {
          css: p_css,
          tokens: p_tokens,
          style: p_style
        };
      },
      getPresetC({
        name = "",
        theme: theme3 = {},
        params,
        set,
        defaults
      }) {
        var _a;
        const {
          preset,
          options
        } = theme3;
        const cPreset = (_a = preset == null ? void 0 : preset.components) == null ? void 0 : _a[name];
        return this.getPreset({
          name,
          preset: cPreset,
          options,
          params,
          set,
          defaults
        });
      },
      getPresetD({
        name = "",
        theme: theme3 = {},
        params,
        set,
        defaults
      }) {
        var _a;
        const dName = name.replace("-directive", "");
        const {
          preset,
          options
        } = theme3;
        const dPreset = (_a = preset == null ? void 0 : preset.directives) == null ? void 0 : _a[dName];
        return this.getPreset({
          name: dName,
          preset: dPreset,
          options,
          params,
          set,
          defaults
        });
      },
      applyDarkColorScheme(options) {
        return !(options.darkModeSelector === "none" || options.darkModeSelector === false);
      },
      getColorSchemeOption(options, defaults) {
        var _a;
        return this.applyDarkColorScheme(options) ? this.regex.resolve(options.darkModeSelector === true ? defaults.options.darkModeSelector : (_a = options.darkModeSelector) != null ? _a : defaults.options.darkModeSelector) : [];
      },
      getLayerOrder(name, options = {}, params, defaults) {
        const {
          cssLayer
        } = options;
        if (cssLayer) {
          const order = resolve(cssLayer.order || "primeui", params);
          return `@layer ${order}`;
        }
        return "";
      },
      getCommonStyleSheet({
        name = "",
        theme: theme3 = {},
        params,
        props = {},
        set,
        defaults
      }) {
        const common = this.getCommon({
          name,
          theme: theme3,
          params,
          set,
          defaults
        });
        const _props = Object.entries(props).reduce((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, []).join(" ");
        return Object.entries(common || {}).reduce((acc, [key, value]) => {
          if (value == null ? void 0 : value.css) {
            const _css = minifyCSS(value == null ? void 0 : value.css);
            const id = `${key}-variables`;
            acc.push(`<style type="text/css" data-primevue-style-id="${id}" ${_props}>${_css}</style>`);
          }
          return acc;
        }, []).join("");
      },
      getStyleSheet({
        name = "",
        theme: theme3 = {},
        params,
        props = {},
        set,
        defaults
      }) {
        var _a;
        const options = {
          name,
          theme: theme3,
          params,
          set,
          defaults
        };
        const preset_css = (_a = name.includes("-directive") ? this.getPresetD(options) : this.getPresetC(options)) == null ? void 0 : _a.css;
        const _props = Object.entries(props).reduce((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, []).join(" ");
        return preset_css ? `<style type="text/css" data-primevue-style-id="${name}-variables" ${_props}>${minifyCSS(preset_css)}</style>` : "";
      },
      createTokens(obj = {}, defaults, parentKey = "", parentPath = "", tokens = {}) {
        Object.entries(obj).forEach(([key, value]) => {
          const currentKey = matchRegex(key, defaults.variable.excludedKeyRegex) ? parentKey : parentKey ? `${parentKey}.${toTokenKey(key)}` : toTokenKey(key);
          const currentPath = parentPath ? `${parentPath}.${key}` : key;
          if (isObject(value)) {
            this.createTokens(value, defaults, currentKey, currentPath, tokens);
          } else {
            tokens[currentKey] || (tokens[currentKey] = {
              paths: [],
              computed(colorScheme, tokenPathMap = {}) {
                var _a, _b;
                if (this.paths.length === 1) {
                  return (_a = this.paths[0]) == null ? void 0 : _a.computed(this.paths[0].scheme, tokenPathMap["binding"]);
                } else if (colorScheme && colorScheme !== "none") {
                  return (_b = this.paths.find((p) => p.scheme === colorScheme)) == null ? void 0 : _b.computed(colorScheme, tokenPathMap["binding"]);
                }
                return this.paths.map((p) => p.computed(p.scheme, tokenPathMap[p.scheme]));
              }
            });
            tokens[currentKey].paths.push({
              path: currentPath,
              value,
              scheme: currentPath.includes("colorScheme.light") ? "light" : currentPath.includes("colorScheme.dark") ? "dark" : "none",
              computed(colorScheme, tokenPathMap = {}) {
                const regex = /{([^}]*)}/g;
                let computedValue = value;
                tokenPathMap["name"] = this.path;
                tokenPathMap["binding"] || (tokenPathMap["binding"] = {});
                if (matchRegex(value, regex)) {
                  const val = value.trim();
                  const _val = val.replaceAll(regex, (v) => {
                    var _a;
                    const path = v.replace(/{|}/g, "");
                    const computed = (_a = tokens[path]) == null ? void 0 : _a.computed(colorScheme, tokenPathMap);
                    return isArray(computed) && computed.length === 2 ? `light-dark(${computed[0].value},${computed[1].value})` : computed == null ? void 0 : computed.value;
                  });
                  const calculationRegex = /(\d+\w*\s+[\+\-\*\/]\s+\d+\w*)/g;
                  const cleanedVarRegex = /var\([^)]+\)/g;
                  computedValue = matchRegex(_val.replace(cleanedVarRegex, "0"), calculationRegex) ? `calc(${_val})` : _val;
                }
                isEmpty(tokenPathMap["binding"]) && delete tokenPathMap["binding"];
                return {
                  colorScheme,
                  path: this.path,
                  paths: tokenPathMap,
                  value: computedValue.includes("undefined") ? void 0 : computedValue
                };
              }
            });
          }
        });
        return tokens;
      },
      getTokenValue(tokens, path, defaults) {
        var _a;
        const normalizePath = (str) => {
          const strArr = str.split(".");
          return strArr.filter((s) => !matchRegex(s.toLowerCase(), defaults.variable.excludedKeyRegex)).join(".");
        };
        const token = normalizePath(path);
        const colorScheme = path.includes("colorScheme.light") ? "light" : path.includes("colorScheme.dark") ? "dark" : void 0;
        const computedValues = [(_a = tokens[token]) == null ? void 0 : _a.computed(colorScheme)].flat().filter((computed) => computed);
        return computedValues.length === 1 ? computedValues[0].value : computedValues.reduce((acc = {}, computed) => {
          const _a2 = computed, {
            colorScheme: cs
          } = _a2, rest = __objRest(_a2, ["colorScheme"]);
          acc[cs] = rest;
          return acc;
        }, void 0);
      },
      getSelectorRule(selector1, selector2, type, css22) {
        return type === "class" || type === "attr" ? getRule(isNotEmpty(selector2) ? `${selector1}${selector2},${selector1} ${selector2}` : selector1, css22) : getRule(selector1, isNotEmpty(selector2) ? getRule(selector2, css22) : css22);
      },
      transformCSS(name, css22, mode, type, options = {}, set, defaults, selector) {
        if (isNotEmpty(css22)) {
          const {
            cssLayer
          } = options;
          if (type !== "style") {
            const colorSchemeOption = this.getColorSchemeOption(options, defaults);
            css22 = mode === "dark" ? colorSchemeOption.reduce((acc, {
              type: type2,
              selector: _selector
            }) => {
              if (isNotEmpty(_selector)) {
                acc += _selector.includes("[CSS]") ? _selector.replace("[CSS]", css22) : this.getSelectorRule(_selector, selector, type2, css22);
              }
              return acc;
            }, "") : getRule(selector != null ? selector : ":root", css22);
          }
          if (cssLayer) {
            const layerOptions = {
              name: "primeui",
              order: "primeui"
            };
            isObject(cssLayer) && (layerOptions.name = resolve(cssLayer.name, {
              name,
              type
            }));
            if (isNotEmpty(layerOptions.name)) {
              css22 = getRule(`@layer ${layerOptions.name}`, css22);
              set == null ? void 0 : set.layerNames(layerOptions.name);
            }
          }
          return css22;
        }
        return "";
      }
    };
    config_default = {
      defaults: {
        variable: {
          prefix: "p",
          selector: ":root",
          excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi
        },
        options: {
          prefix: "p",
          darkModeSelector: "system",
          cssLayer: false
        }
      },
      _theme: void 0,
      _layerNames: /* @__PURE__ */ new Set(),
      _loadedStyleNames: /* @__PURE__ */ new Set(),
      _loadingStyles: /* @__PURE__ */ new Set(),
      _tokens: {},
      update(newValues = {}) {
        const {
          theme: theme3
        } = newValues;
        if (theme3) {
          this._theme = __spreadProps2(__spreadValues2({}, theme3), {
            options: __spreadValues2(__spreadValues2({}, this.defaults.options), theme3.options)
          });
          this._tokens = themeUtils_default.createTokens(this.preset, this.defaults);
          this.clearLoadedStyleNames();
        }
      },
      get theme() {
        return this._theme;
      },
      get preset() {
        var _a;
        return ((_a = this.theme) == null ? void 0 : _a.preset) || {};
      },
      get options() {
        var _a;
        return ((_a = this.theme) == null ? void 0 : _a.options) || {};
      },
      get tokens() {
        return this._tokens;
      },
      getTheme() {
        return this.theme;
      },
      setTheme(newValue) {
        this.update({
          theme: newValue
        });
        service_default.emit("theme:change", newValue);
      },
      getPreset() {
        return this.preset;
      },
      setPreset(newValue) {
        this._theme = __spreadProps2(__spreadValues2({}, this.theme), {
          preset: newValue
        });
        this._tokens = themeUtils_default.createTokens(newValue, this.defaults);
        this.clearLoadedStyleNames();
        service_default.emit("preset:change", newValue);
        service_default.emit("theme:change", this.theme);
      },
      getOptions() {
        return this.options;
      },
      setOptions(newValue) {
        this._theme = __spreadProps2(__spreadValues2({}, this.theme), {
          options: newValue
        });
        this.clearLoadedStyleNames();
        service_default.emit("options:change", newValue);
        service_default.emit("theme:change", this.theme);
      },
      getLayerNames() {
        return [...this._layerNames];
      },
      setLayerNames(layerName) {
        this._layerNames.add(layerName);
      },
      getLoadedStyleNames() {
        return this._loadedStyleNames;
      },
      isStyleNameLoaded(name) {
        return this._loadedStyleNames.has(name);
      },
      setLoadedStyleName(name) {
        this._loadedStyleNames.add(name);
      },
      deleteLoadedStyleName(name) {
        this._loadedStyleNames.delete(name);
      },
      clearLoadedStyleNames() {
        this._loadedStyleNames.clear();
      },
      getTokenValue(tokenPath) {
        return themeUtils_default.getTokenValue(this.tokens, tokenPath, this.defaults);
      },
      getCommon(name = "", params) {
        return themeUtils_default.getCommon({
          name,
          theme: this.theme,
          params,
          defaults: this.defaults,
          set: {
            layerNames: this.setLayerNames.bind(this)
          }
        });
      },
      getComponent(name = "", params) {
        const options = {
          name,
          theme: this.theme,
          params,
          defaults: this.defaults,
          set: {
            layerNames: this.setLayerNames.bind(this)
          }
        };
        return themeUtils_default.getPresetC(options);
      },
      getDirective(name = "", params) {
        const options = {
          name,
          theme: this.theme,
          params,
          defaults: this.defaults,
          set: {
            layerNames: this.setLayerNames.bind(this)
          }
        };
        return themeUtils_default.getPresetD(options);
      },
      getCustomPreset(name = "", preset, selector, params) {
        const options = {
          name,
          preset,
          options: this.options,
          selector,
          params,
          defaults: this.defaults,
          set: {
            layerNames: this.setLayerNames.bind(this)
          }
        };
        return themeUtils_default.getPreset(options);
      },
      getLayerOrderCSS(name = "") {
        return themeUtils_default.getLayerOrder(name, this.options, {
          names: this.getLayerNames()
        }, this.defaults);
      },
      transformCSS(name = "", css22, type = "style", mode) {
        return themeUtils_default.transformCSS(name, css22, mode, type, this.options, {
          layerNames: this.setLayerNames.bind(this)
        }, this.defaults);
      },
      getCommonStyleSheet(name = "", params, props = {}) {
        return themeUtils_default.getCommonStyleSheet({
          name,
          theme: this.theme,
          params,
          props,
          defaults: this.defaults,
          set: {
            layerNames: this.setLayerNames.bind(this)
          }
        });
      },
      getStyleSheet(name, params, props = {}) {
        return themeUtils_default.getStyleSheet({
          name,
          theme: this.theme,
          params,
          props,
          defaults: this.defaults,
          set: {
            layerNames: this.setLayerNames.bind(this)
          }
        });
      },
      onStyleMounted(name) {
        this._loadingStyles.add(name);
      },
      onStyleUpdated(name) {
        this._loadingStyles.add(name);
      },
      onStyleLoaded(event, {
        name
      }) {
        if (this._loadingStyles.size) {
          this._loadingStyles.delete(name);
          service_default.emit(`theme:${name}:load`, event);
          !this._loadingStyles.size && service_default.emit("theme:load");
        }
      }
    };
  }
});

// node_modules/primeng/fesm2022/primeng-usestyle.mjs
var _id, UseStyle;
var init_primeng_usestyle = __esm({
  "node_modules/primeng/fesm2022/primeng-usestyle.mjs"() {
    "use strict";
    init_common();
    init_core();
    init_core();
    init_utils();
    _id = 0;
    UseStyle = class _UseStyle {
      document = inject(DOCUMENT);
      use(css3, options = {}) {
        let isLoaded = false;
        let cssRef = css3;
        let styleRef = null;
        const {
          immediate = true,
          manual = false,
          name = `style_${++_id}`,
          id = void 0,
          media = void 0,
          nonce = void 0,
          first: first2 = false,
          props = {}
        } = options;
        if (!this.document) return;
        styleRef = this.document.querySelector(`style[data-primeng-style-id="${name}"]`) || id && this.document.getElementById(id) || this.document.createElement("style");
        if (!styleRef.isConnected) {
          cssRef = css3;
          setAttributes(styleRef, {
            type: "text/css",
            media,
            nonce
          });
          const HEAD = this.document.head;
          first2 && HEAD.firstChild ? HEAD.insertBefore(styleRef, HEAD.firstChild) : HEAD.appendChild(styleRef);
          setAttribute(styleRef, "data-primeng-style-id", name);
        }
        if (styleRef.textContent !== cssRef) {
          styleRef.textContent = cssRef;
        }
        return {
          id,
          name,
          el: styleRef,
          css: cssRef
        };
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _UseStyle,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _UseStyle,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: UseStyle,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-base.mjs
var base, theme, css, BaseStyle;
var init_primeng_base = __esm({
  "node_modules/primeng/fesm2022/primeng-base.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_styled();
    init_utils();
    init_primeng_usestyle();
    base = {
      _loadedStyleNames: /* @__PURE__ */ new Set(),
      getLoadedStyleNames() {
        return this._loadedStyleNames;
      },
      isStyleNameLoaded(name) {
        return this._loadedStyleNames.has(name);
      },
      setLoadedStyleName(name) {
        this._loadedStyleNames.add(name);
      },
      deleteLoadedStyleName(name) {
        this._loadedStyleNames.delete(name);
      },
      clearLoadedStyleNames() {
        this._loadedStyleNames.clear();
      }
    };
    theme = ({
      dt: dt2
    }) => `
*,
::before,
::after {
    box-sizing: border-box;
}

/* Non ng overlay animations */
.p-connected-overlay {
    opacity: 0;
    transform: scaleY(0.8);
    transition: transform 0.12s cubic-bezier(0, 0, 0.2, 1),
        opacity 0.12s cubic-bezier(0, 0, 0.2, 1);
}

.p-connected-overlay-visible {
    opacity: 1;
    transform: scaleY(1);
}

.p-connected-overlay-hidden {
    opacity: 0;
    transform: scaleY(1);
    transition: opacity 0.1s linear;
}

/* NG based overlay animations */
.p-connected-overlay-enter-from {
    opacity: 0;
    transform: scaleY(0.8);
}

.p-connected-overlay-leave-to {
    opacity: 0;
}

.p-connected-overlay-enter-active {
    transition: transform 0.12s cubic-bezier(0, 0, 0.2, 1),
        opacity 0.12s cubic-bezier(0, 0, 0.2, 1);
}

.p-connected-overlay-leave-active {
    transition: opacity 0.1s linear;
}

/* Toggleable Content */
.p-toggleable-content-enter-from,
.p-toggleable-content-leave-to {
    max-height: 0;
}

.p-toggleable-content-enter-to,
.p-toggleable-content-leave-from {
    max-height: 1000px;
}

.p-toggleable-content-leave-active {
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1);
}

.p-toggleable-content-enter-active {
    overflow: hidden;
    transition: max-height 1s ease-in-out;
}

.p-disabled,
.p-disabled * {
    cursor: default;
    pointer-events: none;
    user-select: none;
}

.p-disabled,
.p-component:disabled {
    opacity: ${dt2("disabled.opacity")};
}

.pi {
    font-size: ${dt2("icon.size")};
}

.p-icon {
    width: ${dt2("icon.size")};
    height: ${dt2("icon.size")};
}

.p-unselectable-text {
    user-select: none;
}

.p-overlay-mask {
    background: ${dt2("mask.background")};
    color: ${dt2("mask.color")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-overlay-mask-enter {
    animation: p-overlay-mask-enter-animation ${dt2("mask.transition.duration")} forwards;
}

.p-overlay-mask-leave {
    animation: p-overlay-mask-leave-animation ${dt2("mask.transition.duration")} forwards;
}
/* Temporarily disabled, distrupts PrimeNG overlay animations */
/* @keyframes p-overlay-mask-enter-animation {
    from {
        background: transparent;
    }
    to {
        background: ${dt2("mask.background")};
    }
}
@keyframes p-overlay-mask-leave-animation {
    from {
        background: ${dt2("mask.background")};
    }
    to {
        background: transparent;
    }
}*/

.p-iconwrapper {
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
`;
    css = ({
      dt: dt2
    }) => `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.p-hidden-accessible input,
.p-hidden-accessible select {
    transform: scale(0);
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: ${dt2("scrollbar.width")};
}

/* @todo move to baseiconstyle.ts */

.p-icon {
    display: inline-block;
    vertical-align: baseline;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`;
    BaseStyle = class _BaseStyle {
      name = "base";
      useStyle = inject(UseStyle);
      theme = void 0;
      css = void 0;
      classes = {};
      inlineStyles = {};
      load = (style2, options = {}, transform = (cs) => cs) => {
        const computedStyle = transform(resolve(style2, {
          dt
        }));
        return computedStyle ? this.useStyle.use(minifyCSS(computedStyle), __spreadValues({
          name: this.name
        }, options)) : {};
      };
      loadCSS = (options = {}) => {
        return this.load(this.css, options);
      };
      loadTheme = (options = {}, style2 = "") => {
        return this.load(this.theme, options, (computedStyle = "") => config_default.transformCSS(options.name || this.name, `${computedStyle}${style2}`));
      };
      loadGlobalCSS = (options = {}) => {
        return this.load(css, options);
      };
      loadGlobalTheme = (options = {}, style2 = "") => {
        return this.load(theme, options, (computedStyle = "") => config_default.transformCSS(options.name || this.name, `${computedStyle}${style2}`));
      };
      getCommonTheme = (params) => {
        return config_default.getCommon(this.name, params);
      };
      getComponentTheme = (params) => {
        return config_default.getComponent(this.name, params);
      };
      getDirectiveTheme = (params) => {
        return config_default.getDirective(this.name, params);
      };
      getPresetTheme = (preset, selector, params) => {
        return config_default.getCustomPreset(this.name, preset, selector, params);
      };
      getLayerOrderThemeCSS = () => {
        return config_default.getLayerOrderCSS(this.name);
      };
      getStyleSheet = (extendedCSS = "", props = {}) => {
        if (this.css) {
          const _css = resolve(this.css, {
            dt
          });
          const _style = minifyCSS(`${_css}${extendedCSS}`);
          const _props = Object.entries(props).reduce((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, []).join(" ");
          return `<style type="text/css" data-primeng-style-id="${this.name}" ${_props}>${_style}</style>`;
        }
        return "";
      };
      getCommonThemeStyleSheet = (params, props = {}) => {
        return config_default.getCommonStyleSheet(this.name, params, props);
      };
      getThemeStyleSheet = (params, props = {}) => {
        let css3 = [config_default.getStyleSheet(this.name, params, props)];
        if (this.theme) {
          const name = this.name === "base" ? "global-style" : `${this.name}-style`;
          const _css = resolve(this.theme, {
            dt
          });
          const _style = minifyCSS(config_default.transformCSS(name, _css));
          const _props = Object.entries(props).reduce((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, []).join(" ");
          css3.push(`<style type="text/css" data-primeng-style-id="${name}" ${_props}>${_style}</style>`);
        }
        return css3.join("");
      };
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseStyle,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseStyle,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BaseStyle,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-config.mjs
var ThemeProvider, PrimeNG, PRIME_NG_CONFIG;
var init_primeng_config = __esm({
  "node_modules/primeng/fesm2022/primeng-config.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_api();
    init_esm();
    init_common();
    init_styled();
    init_primeng_base();
    ThemeProvider = class _ThemeProvider {
      // @todo define type for theme
      theme = signal(void 0);
      csp = signal({
        nonce: void 0
      });
      isThemeChanged = false;
      document = inject(DOCUMENT);
      baseStyle = inject(BaseStyle);
      constructor() {
        effect(() => {
          service_default.on("theme:change", (newTheme) => {
            untracked(() => {
              this.isThemeChanged = true;
              this.theme.set(newTheme);
            });
          });
        });
        effect(() => {
          const themeValue = this.theme();
          if (this.document && themeValue) {
            if (!this.isThemeChanged) {
              this.onThemeChange(themeValue);
            }
            this.isThemeChanged = false;
          }
        });
      }
      ngOnDestroy() {
        config_default.clearLoadedStyleNames();
        service_default.clear();
      }
      onThemeChange(value) {
        config_default.setTheme(value);
        if (this.document) {
          this.loadCommonTheme();
        }
      }
      loadCommonTheme() {
        if (this.theme() === "none") return;
        if (!config_default.isStyleNameLoaded("common")) {
          const {
            primitive,
            semantic,
            global,
            style: style2
          } = this.baseStyle.getCommonTheme?.() || {};
          const styleOptions = {
            nonce: this.csp?.()?.nonce
          };
          this.baseStyle.load(primitive?.css, __spreadValues({
            name: "primitive-variables"
          }, styleOptions));
          this.baseStyle.load(semantic?.css, __spreadValues({
            name: "semantic-variables"
          }, styleOptions));
          this.baseStyle.load(global?.css, __spreadValues({
            name: "global-variables"
          }, styleOptions));
          this.baseStyle.loadGlobalTheme(__spreadValues({
            name: "global-style"
          }, styleOptions), style2);
          config_default.setLoadedStyleName("common");
        }
      }
      setThemeConfig(config) {
        const {
          theme: theme3,
          csp
        } = config || {};
        if (theme3) this.theme.set(theme3);
        if (csp) this.csp.set(csp);
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ThemeProvider,
        deps: [],
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ThemeProvider,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ThemeProvider,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }],
      ctorParameters: () => []
    });
    PrimeNG = class _PrimeNG extends ThemeProvider {
      ripple = signal(false);
      platformId = inject(PLATFORM_ID);
      inputStyle = signal(null);
      inputVariant = signal(null);
      overlayOptions = {};
      csp = signal({
        nonce: void 0
      });
      filterMatchModeOptions = {
        text: [FilterMatchMode.STARTS_WITH, FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS, FilterMatchMode.ENDS_WITH, FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS],
        numeric: [FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS, FilterMatchMode.LESS_THAN, FilterMatchMode.LESS_THAN_OR_EQUAL_TO, FilterMatchMode.GREATER_THAN, FilterMatchMode.GREATER_THAN_OR_EQUAL_TO],
        date: [FilterMatchMode.DATE_IS, FilterMatchMode.DATE_IS_NOT, FilterMatchMode.DATE_BEFORE, FilterMatchMode.DATE_AFTER]
      };
      translation = {
        startsWith: "Starts with",
        contains: "Contains",
        notContains: "Not contains",
        endsWith: "Ends with",
        equals: "Equals",
        notEquals: "Not equals",
        noFilter: "No Filter",
        lt: "Less than",
        lte: "Less than or equal to",
        gt: "Greater than",
        gte: "Greater than or equal to",
        is: "Is",
        isNot: "Is not",
        before: "Before",
        after: "After",
        dateIs: "Date is",
        dateIsNot: "Date is not",
        dateBefore: "Date is before",
        dateAfter: "Date is after",
        clear: "Clear",
        apply: "Apply",
        matchAll: "Match All",
        matchAny: "Match Any",
        addRule: "Add Rule",
        removeRule: "Remove Rule",
        accept: "Yes",
        reject: "No",
        choose: "Choose",
        upload: "Upload",
        cancel: "Cancel",
        pending: "Pending",
        fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        chooseYear: "Choose Year",
        chooseMonth: "Choose Month",
        chooseDate: "Choose Date",
        prevDecade: "Previous Decade",
        nextDecade: "Next Decade",
        prevYear: "Previous Year",
        nextYear: "Next Year",
        prevMonth: "Previous Month",
        nextMonth: "Next Month",
        prevHour: "Previous Hour",
        nextHour: "Next Hour",
        prevMinute: "Previous Minute",
        nextMinute: "Next Minute",
        prevSecond: "Previous Second",
        nextSecond: "Next Second",
        am: "am",
        pm: "pm",
        dateFormat: "mm/dd/yy",
        firstDayOfWeek: 0,
        today: "Today",
        weekHeader: "Wk",
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
        passwordPrompt: "Enter a password",
        emptyMessage: "No results found",
        searchMessage: "Search results are available",
        selectionMessage: "{0} items selected",
        emptySelectionMessage: "No selected item",
        emptySearchMessage: "No results found",
        emptyFilterMessage: "No results found",
        fileChosenMessage: "Files",
        noFileChosenMessage: "No file chosen",
        aria: {
          trueLabel: "True",
          falseLabel: "False",
          nullLabel: "Not Selected",
          star: "1 star",
          stars: "{star} stars",
          selectAll: "All items selected",
          unselectAll: "All items unselected",
          close: "Close",
          previous: "Previous",
          next: "Next",
          navigation: "Navigation",
          scrollTop: "Scroll Top",
          moveTop: "Move Top",
          moveUp: "Move Up",
          moveDown: "Move Down",
          moveBottom: "Move Bottom",
          moveToTarget: "Move to Target",
          moveToSource: "Move to Source",
          moveAllToTarget: "Move All to Target",
          moveAllToSource: "Move All to Source",
          pageLabel: "{page}",
          firstPageLabel: "First Page",
          lastPageLabel: "Last Page",
          nextPageLabel: "Next Page",
          prevPageLabel: "Previous Page",
          rowsPerPageLabel: "Rows per page",
          previousPageLabel: "Previous Page",
          jumpToPageDropdownLabel: "Jump to Page Dropdown",
          jumpToPageInputLabel: "Jump to Page Input",
          selectRow: "Row Selected",
          unselectRow: "Row Unselected",
          expandRow: "Row Expanded",
          collapseRow: "Row Collapsed",
          showFilterMenu: "Show Filter Menu",
          hideFilterMenu: "Hide Filter Menu",
          filterOperator: "Filter Operator",
          filterConstraint: "Filter Constraint",
          editRow: "Row Edit",
          saveEdit: "Save Edit",
          cancelEdit: "Cancel Edit",
          listView: "List View",
          gridView: "Grid View",
          slide: "Slide",
          slideNumber: "{slideNumber}",
          zoomImage: "Zoom Image",
          zoomIn: "Zoom In",
          zoomOut: "Zoom Out",
          rotateRight: "Rotate Right",
          rotateLeft: "Rotate Left",
          listLabel: "Option List",
          selectColor: "Select a color",
          removeLabel: "Remove",
          browseFiles: "Browse Files",
          maximizeLabel: "Maximize"
        }
      };
      zIndex = {
        modal: 1100,
        overlay: 1e3,
        menu: 1e3,
        tooltip: 1100
      };
      translationSource = new Subject();
      translationObserver = this.translationSource.asObservable();
      getTranslation(key) {
        return this.translation[key];
      }
      setTranslation(value) {
        this.translation = __spreadValues(__spreadValues({}, this.translation), value);
        this.translationSource.next(this.translation);
      }
      setConfig(config) {
        const {
          csp,
          ripple,
          inputStyle,
          inputVariant,
          theme: theme3,
          overlayOptions,
          translation,
          filterMatchModeOptions
        } = config || {};
        if (csp) this.csp.set(csp);
        if (ripple) this.ripple.set(ripple);
        if (inputStyle) this.inputStyle.set(inputStyle);
        if (inputVariant) this.inputVariant.set(inputVariant);
        if (overlayOptions) this.overlayOptions = overlayOptions;
        if (translation) this.setTranslation(translation);
        if (filterMatchModeOptions) this.filterMatchModeOptions = filterMatchModeOptions;
        if (theme3) this.setThemeConfig({
          theme: theme3,
          csp
        });
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _PrimeNG,
        deps: null,
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _PrimeNG,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: PrimeNG,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    PRIME_NG_CONFIG = new InjectionToken("PRIME_NG_CONFIG");
  }
});

// node_modules/primeng/fesm2022/primeng-basecomponent.mjs
var BaseComponentStyle, BaseComponent;
var init_primeng_basecomponent = __esm({
  "node_modules/primeng/fesm2022/primeng-basecomponent.mjs"() {
    "use strict";
    init_common();
    init_core();
    init_core();
    init_styled();
    init_utils();
    init_primeng_base();
    init_primeng_config();
    BaseComponentStyle = class _BaseComponentStyle extends BaseStyle {
      name = "common";
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseComponentStyle,
        deps: null,
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseComponentStyle,
        providedIn: "root"
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BaseComponentStyle,
      decorators: [{
        type: Injectable,
        args: [{
          providedIn: "root"
        }]
      }]
    });
    BaseComponent = class _BaseComponent {
      document = inject(DOCUMENT);
      platformId = inject(PLATFORM_ID);
      el = inject(ElementRef);
      injector = inject(Injector);
      cd = inject(ChangeDetectorRef);
      renderer = inject(Renderer2);
      config = inject(PrimeNG);
      baseComponentStyle = inject(BaseComponentStyle);
      baseStyle = inject(BaseStyle);
      scopedStyleEl;
      rootEl;
      dt;
      get styleOptions() {
        return {
          nonce: this.config?.csp().nonce
        };
      }
      get _name() {
        return this.constructor.name.replace(/^_/, "").toLowerCase();
      }
      get componentStyle() {
        return this["_componentStyle"];
      }
      attrSelector = uuid("pc");
      themeChangeListeners = [];
      _getHostInstance(instance) {
        if (instance) {
          return instance ? this["hostName"] ? instance["name"] === this["hostName"] ? instance : this._getHostInstance(instance.parentInstance) : instance.parentInstance : void 0;
        }
      }
      _getOptionValue(options, key = "", params = {}) {
        return getKeyValue(options, key, params);
      }
      ngOnInit() {
        if (this.document) {
          this._loadStyles();
        }
      }
      ngAfterViewInit() {
        this.rootEl = this.el?.nativeElement;
        if (this.rootEl) {
          this.rootEl?.setAttribute(this.attrSelector, "");
        }
      }
      ngOnChanges(changes) {
        if (this.document && !isPlatformServer(this.platformId)) {
          const {
            dt: dt2
          } = changes;
          if (dt2 && dt2.currentValue) {
            this._loadScopedThemeStyles(dt2.currentValue);
            this._themeChangeListener(() => this._loadScopedThemeStyles(dt2.currentValue));
          }
        }
      }
      ngOnDestroy() {
        this._unloadScopedThemeStyles();
        this.themeChangeListeners.forEach((callback) => service_default.off("theme:change", callback));
      }
      _loadStyles() {
        const _load = () => {
          if (!base.isStyleNameLoaded("base")) {
            this.baseStyle.loadGlobalCSS(this.styleOptions);
            base.setLoadedStyleName("base");
          }
          this._loadThemeStyles();
        };
        _load();
        this._themeChangeListener(() => _load());
      }
      _loadCoreStyles() {
        if (!base.isStyleNameLoaded("base") && this._name) {
          this.baseComponentStyle.loadCSS(this.styleOptions);
          this.componentStyle && this.componentStyle?.loadCSS(this.styleOptions);
          base.setLoadedStyleName(this.componentStyle?.name);
        }
      }
      _loadThemeStyles() {
        if (!config_default.isStyleNameLoaded("common")) {
          const {
            primitive,
            semantic,
            global,
            style: style2
          } = this.componentStyle?.getCommonTheme?.() || {};
          this.baseStyle.load(primitive?.css, __spreadValues({
            name: "primitive-variables"
          }, this.styleOptions));
          this.baseStyle.load(semantic?.css, __spreadValues({
            name: "semantic-variables"
          }, this.styleOptions));
          this.baseStyle.load(global?.css, __spreadValues({
            name: "global-variables"
          }, this.styleOptions));
          this.baseStyle.loadGlobalTheme(__spreadValues({
            name: "global-style"
          }, this.styleOptions), style2);
          config_default.setLoadedStyleName("common");
        }
        if (!config_default.isStyleNameLoaded(this.componentStyle?.name) && this.componentStyle?.name) {
          const {
            css: css3,
            style: style2
          } = this.componentStyle?.getComponentTheme?.() || {};
          this.componentStyle?.load(css3, __spreadValues({
            name: `${this.componentStyle?.name}-variables`
          }, this.styleOptions));
          this.componentStyle?.loadTheme(__spreadValues({
            name: `${this.componentStyle?.name}-style`
          }, this.styleOptions), style2);
          config_default.setLoadedStyleName(this.componentStyle?.name);
        }
        if (!config_default.isStyleNameLoaded("layer-order")) {
          const layerOrder = this.componentStyle?.getLayerOrderThemeCSS?.();
          this.baseStyle.load(layerOrder, __spreadValues({
            name: "layer-order",
            first: true
          }, this.styleOptions));
          config_default.setLoadedStyleName("layer-order");
        }
        if (this.dt) {
          this._loadScopedThemeStyles(this.dt);
          this._themeChangeListener(() => this._loadScopedThemeStyles(this.dt));
        }
      }
      _loadScopedThemeStyles(preset) {
        const {
          css: css3
        } = this.componentStyle?.getPresetTheme?.(preset, `[${this.attrSelector}]`) || {};
        const scopedStyle = this.componentStyle?.load(css3, __spreadValues({
          name: `${this.attrSelector}-${this.componentStyle?.name}`
        }, this.styleOptions));
        this.scopedStyleEl = scopedStyle?.el;
      }
      _unloadScopedThemeStyles() {
        this.scopedStyleEl?.remove();
      }
      _themeChangeListener(callback = () => {
      }) {
        base.clearLoadedStyleNames();
        service_default.on("theme:change", callback);
        this.themeChangeListeners.push(callback);
      }
      cx(arg, rest) {
        const classes2 = this.parent ? this.parent.componentStyle?.classes?.[arg] : this.componentStyle?.classes?.[arg];
        if (typeof classes2 === "function") {
          return classes2({
            instance: this
          });
        }
        return typeof classes2 === "string" ? classes2 : arg;
      }
      sx(arg) {
        const styles = this.componentStyle?.inlineStyles?.[arg];
        if (typeof styles === "function") {
          return styles({
            instance: this
          });
        }
        if (typeof styles === "string") {
          return styles;
        } else {
          return __spreadValues({}, styles);
        }
      }
      // cx(key = '', params = {}) {
      //     const classes = this.parent ? this.parent.componentStyle?.classes : this.componentStyle?.classes;
      //     return this._getOptionValue(classes({ instance: this._getHostInstance(this) }), key, { ...params });
      // }
      get parent() {
        return this["parentInstance"];
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseComponent,
        deps: [],
        target: FactoryTarget.Directive
      });
      static \u0275dir = \u0275\u0275ngDeclareDirective({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _BaseComponent,
        isStandalone: true,
        inputs: {
          dt: "dt"
        },
        providers: [BaseComponentStyle, BaseStyle],
        usesOnChanges: true,
        ngImport: core_exports
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BaseComponent,
      decorators: [{
        type: Directive,
        args: [{
          standalone: true,
          providers: [BaseComponentStyle, BaseStyle]
        }]
      }],
      propDecorators: {
        dt: [{
          type: Input
        }]
      }
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-baseicon.mjs
var css2, BaseIconStyle, BaseIconClasses, BaseIcon;
var init_primeng_icons_baseicon = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-baseicon.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_basecomponent();
    init_primeng_base();
    css2 = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`;
    BaseIconStyle = class _BaseIconStyle extends BaseStyle {
      name = "baseicon";
      inlineStyles = css2;
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseIconStyle,
        deps: null,
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseIconStyle
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BaseIconStyle,
      decorators: [{
        type: Injectable
      }]
    });
    (function(BaseIconClasses2) {
      BaseIconClasses2["root"] = "p-icon";
    })(BaseIconClasses || (BaseIconClasses = {}));
    BaseIcon = class _BaseIcon extends BaseComponent {
      label;
      spin = false;
      styleClass;
      role;
      ariaLabel;
      ariaHidden;
      ngOnInit() {
        super.ngOnInit();
        this.getAttributes();
      }
      getAttributes() {
        const isLabelEmpty = isEmpty(this.label);
        this.role = !isLabelEmpty ? "img" : void 0;
        this.ariaLabel = !isLabelEmpty ? this.label : void 0;
        this.ariaHidden = isLabelEmpty;
      }
      getClassNames() {
        return `p-icon ${this.styleClass ? this.styleClass + " " : ""}${this.spin ? "p-icon-spin" : ""}`;
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BaseIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "16.1.0",
        version: "19.2.10",
        type: _BaseIcon,
        isStandalone: true,
        selector: "ng-component",
        inputs: {
          label: "label",
          spin: ["spin", "spin", booleanAttribute],
          styleClass: "styleClass"
        },
        host: {
          classAttribute: "p-component p-iconwrapper"
        },
        providers: [BaseIconStyle],
        usesInheritance: true,
        ngImport: core_exports,
        template: ` <ng-content></ng-content> `,
        isInline: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BaseIcon,
      decorators: [{
        type: Component,
        args: [{
          template: ` <ng-content></ng-content> `,
          standalone: true,
          changeDetection: ChangeDetectionStrategy.OnPush,
          encapsulation: ViewEncapsulation.None,
          providers: [BaseIconStyle],
          host: {
            class: "p-component p-iconwrapper"
          }
        }]
      }],
      propDecorators: {
        label: [{
          type: Input
        }],
        spin: [{
          type: Input,
          args: [{
            transform: booleanAttribute
          }]
        }],
        styleClass: [{
          type: Input
        }]
      }
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angledoubledown.mjs
var AngleDoubleDownIcon;
var init_primeng_icons_angledoubledown = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angledoubledown.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleDoubleDownIcon = class _AngleDoubleDownIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleDoubleDownIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleDoubleDownIcon,
        isStandalone: true,
        selector: "AngleDoubleDownIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.70786 6.59831C6.80043 6.63674 6.89974 6.65629 6.99997 6.65581C7.19621 6.64081 7.37877 6.54953 7.50853 6.40153L11.0685 2.8416C11.1364 2.69925 11.1586 2.53932 11.132 2.38384C11.1053 2.22837 11.0311 2.08498 10.9195 1.97343C10.808 1.86188 10.6646 1.78766 10.5091 1.76099C10.3536 1.73431 10.1937 1.75649 10.0513 1.82448L6.99997 4.87585L3.9486 1.82448C3.80625 1.75649 3.64632 1.73431 3.49084 1.76099C3.33536 1.78766 3.19197 1.86188 3.08043 1.97343C2.96888 2.08498 2.89466 2.22837 2.86798 2.38384C2.84131 2.53932 2.86349 2.69925 2.93147 2.8416L6.46089 6.43205C6.53132 6.50336 6.61528 6.55989 6.70786 6.59831ZM6.70786 12.1925C6.80043 12.2309 6.89974 12.2505 6.99997 12.25C7.10241 12.2465 7.20306 12.2222 7.29575 12.1785C7.38845 12.1348 7.47124 12.0726 7.53905 11.9957L11.0685 8.46629C11.1614 8.32292 11.2036 8.15249 11.1881 7.98233C11.1727 7.81216 11.1005 7.6521 10.9833 7.52781C10.866 7.40353 10.7104 7.3222 10.5415 7.29688C10.3725 7.27155 10.1999 7.30369 10.0513 7.38814L6.99997 10.4395L3.9486 7.38814C3.80006 7.30369 3.62747 7.27155 3.45849 7.29688C3.28951 7.3222 3.13393 7.40353 3.01667 7.52781C2.89942 7.6521 2.82729 7.81216 2.81184 7.98233C2.79639 8.15249 2.83852 8.32292 2.93148 8.46629L6.4609 12.0262C6.53133 12.0975 6.61529 12.1541 6.70786 12.1925Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleDoubleDownIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleDoubleDownIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.70786 6.59831C6.80043 6.63674 6.89974 6.65629 6.99997 6.65581C7.19621 6.64081 7.37877 6.54953 7.50853 6.40153L11.0685 2.8416C11.1364 2.69925 11.1586 2.53932 11.132 2.38384C11.1053 2.22837 11.0311 2.08498 10.9195 1.97343C10.808 1.86188 10.6646 1.78766 10.5091 1.76099C10.3536 1.73431 10.1937 1.75649 10.0513 1.82448L6.99997 4.87585L3.9486 1.82448C3.80625 1.75649 3.64632 1.73431 3.49084 1.76099C3.33536 1.78766 3.19197 1.86188 3.08043 1.97343C2.96888 2.08498 2.89466 2.22837 2.86798 2.38384C2.84131 2.53932 2.86349 2.69925 2.93147 2.8416L6.46089 6.43205C6.53132 6.50336 6.61528 6.55989 6.70786 6.59831ZM6.70786 12.1925C6.80043 12.2309 6.89974 12.2505 6.99997 12.25C7.10241 12.2465 7.20306 12.2222 7.29575 12.1785C7.38845 12.1348 7.47124 12.0726 7.53905 11.9957L11.0685 8.46629C11.1614 8.32292 11.2036 8.15249 11.1881 7.98233C11.1727 7.81216 11.1005 7.6521 10.9833 7.52781C10.866 7.40353 10.7104 7.3222 10.5415 7.29688C10.3725 7.27155 10.1999 7.30369 10.0513 7.38814L6.99997 10.4395L3.9486 7.38814C3.80006 7.30369 3.62747 7.27155 3.45849 7.29688C3.28951 7.3222 3.13393 7.40353 3.01667 7.52781C2.89942 7.6521 2.82729 7.81216 2.81184 7.98233C2.79639 8.15249 2.83852 8.32292 2.93148 8.46629L6.4609 12.0262C6.53133 12.0975 6.61529 12.1541 6.70786 12.1925Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angledoubleleft.mjs
var AngleDoubleLeftIcon;
var init_primeng_icons_angledoubleleft = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angledoubleleft.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleDoubleLeftIcon = class _AngleDoubleLeftIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleDoubleLeftIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleDoubleLeftIcon,
        isStandalone: true,
        selector: "AngleDoubleLeftIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.71602 11.164C5.80782 11.2021 5.9063 11.2215 6.00569 11.221C6.20216 11.2301 6.39427 11.1612 6.54025 11.0294C6.68191 10.8875 6.76148 10.6953 6.76148 10.4948C6.76148 10.2943 6.68191 10.1021 6.54025 9.96024L3.51441 6.9344L6.54025 3.90855C6.624 3.76126 6.65587 3.59011 6.63076 3.42254C6.60564 3.25498 6.525 3.10069 6.40175 2.98442C6.2785 2.86815 6.11978 2.79662 5.95104 2.7813C5.78229 2.76598 5.61329 2.80776 5.47112 2.89994L1.97123 6.39983C1.82957 6.54167 1.75 6.73393 1.75 6.9344C1.75 7.13486 1.82957 7.32712 1.97123 7.46896L5.47112 10.9991C5.54096 11.0698 5.62422 11.1259 5.71602 11.164ZM11.0488 10.9689C11.1775 11.1156 11.3585 11.2061 11.5531 11.221C11.7477 11.2061 11.9288 11.1156 12.0574 10.9689C12.1815 10.8302 12.25 10.6506 12.25 10.4645C12.25 10.2785 12.1815 10.0989 12.0574 9.96024L9.03158 6.93439L12.0574 3.90855C12.1248 3.76739 12.1468 3.60881 12.1204 3.45463C12.0939 3.30045 12.0203 3.15826 11.9097 3.04765C11.7991 2.93703 11.6569 2.86343 11.5027 2.83698C11.3486 2.81053 11.19 2.83252 11.0488 2.89994L7.51865 6.36957C7.37699 6.51141 7.29742 6.70367 7.29742 6.90414C7.29742 7.1046 7.37699 7.29686 7.51865 7.4387L11.0488 10.9689Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleDoubleLeftIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleDoubleLeftIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.71602 11.164C5.80782 11.2021 5.9063 11.2215 6.00569 11.221C6.20216 11.2301 6.39427 11.1612 6.54025 11.0294C6.68191 10.8875 6.76148 10.6953 6.76148 10.4948C6.76148 10.2943 6.68191 10.1021 6.54025 9.96024L3.51441 6.9344L6.54025 3.90855C6.624 3.76126 6.65587 3.59011 6.63076 3.42254C6.60564 3.25498 6.525 3.10069 6.40175 2.98442C6.2785 2.86815 6.11978 2.79662 5.95104 2.7813C5.78229 2.76598 5.61329 2.80776 5.47112 2.89994L1.97123 6.39983C1.82957 6.54167 1.75 6.73393 1.75 6.9344C1.75 7.13486 1.82957 7.32712 1.97123 7.46896L5.47112 10.9991C5.54096 11.0698 5.62422 11.1259 5.71602 11.164ZM11.0488 10.9689C11.1775 11.1156 11.3585 11.2061 11.5531 11.221C11.7477 11.2061 11.9288 11.1156 12.0574 10.9689C12.1815 10.8302 12.25 10.6506 12.25 10.4645C12.25 10.2785 12.1815 10.0989 12.0574 9.96024L9.03158 6.93439L12.0574 3.90855C12.1248 3.76739 12.1468 3.60881 12.1204 3.45463C12.0939 3.30045 12.0203 3.15826 11.9097 3.04765C11.7991 2.93703 11.6569 2.86343 11.5027 2.83698C11.3486 2.81053 11.19 2.83252 11.0488 2.89994L7.51865 6.36957C7.37699 6.51141 7.29742 6.70367 7.29742 6.90414C7.29742 7.1046 7.37699 7.29686 7.51865 7.4387L11.0488 10.9689Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angledoubleright.mjs
var AngleDoubleRightIcon;
var init_primeng_icons_angledoubleright = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angledoubleright.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleDoubleRightIcon = class _AngleDoubleRightIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleDoubleRightIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleDoubleRightIcon,
        isStandalone: true,
        selector: "AngleDoubleRightIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.68757 11.1451C7.7791 11.1831 7.8773 11.2024 7.9764 11.2019C8.07769 11.1985 8.17721 11.1745 8.26886 11.1312C8.36052 11.088 8.44238 11.0265 8.50943 10.9505L12.0294 7.49085C12.1707 7.34942 12.25 7.15771 12.25 6.95782C12.25 6.75794 12.1707 6.56622 12.0294 6.42479L8.50943 2.90479C8.37014 2.82159 8.20774 2.78551 8.04633 2.80192C7.88491 2.81833 7.73309 2.88635 7.6134 2.99588C7.4937 3.10541 7.41252 3.25061 7.38189 3.40994C7.35126 3.56927 7.37282 3.73423 7.44337 3.88033L10.4605 6.89748L7.44337 9.91463C7.30212 10.0561 7.22278 10.2478 7.22278 10.4477C7.22278 10.6475 7.30212 10.8393 7.44337 10.9807C7.51301 11.0512 7.59603 11.1071 7.68757 11.1451ZM1.94207 10.9505C2.07037 11.0968 2.25089 11.1871 2.44493 11.2019C2.63898 11.1871 2.81949 11.0968 2.94779 10.9505L6.46779 7.49085C6.60905 7.34942 6.68839 7.15771 6.68839 6.95782C6.68839 6.75793 6.60905 6.56622 6.46779 6.42479L2.94779 2.90479C2.80704 2.83757 2.6489 2.81563 2.49517 2.84201C2.34143 2.86839 2.19965 2.94178 2.08936 3.05207C1.97906 3.16237 1.90567 3.30415 1.8793 3.45788C1.85292 3.61162 1.87485 3.76975 1.94207 3.9105L4.95922 6.92765L1.94207 9.9448C1.81838 10.0831 1.75 10.2621 1.75 10.4477C1.75 10.6332 1.81838 10.8122 1.94207 10.9505Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleDoubleRightIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleDoubleRightIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.68757 11.1451C7.7791 11.1831 7.8773 11.2024 7.9764 11.2019C8.07769 11.1985 8.17721 11.1745 8.26886 11.1312C8.36052 11.088 8.44238 11.0265 8.50943 10.9505L12.0294 7.49085C12.1707 7.34942 12.25 7.15771 12.25 6.95782C12.25 6.75794 12.1707 6.56622 12.0294 6.42479L8.50943 2.90479C8.37014 2.82159 8.20774 2.78551 8.04633 2.80192C7.88491 2.81833 7.73309 2.88635 7.6134 2.99588C7.4937 3.10541 7.41252 3.25061 7.38189 3.40994C7.35126 3.56927 7.37282 3.73423 7.44337 3.88033L10.4605 6.89748L7.44337 9.91463C7.30212 10.0561 7.22278 10.2478 7.22278 10.4477C7.22278 10.6475 7.30212 10.8393 7.44337 10.9807C7.51301 11.0512 7.59603 11.1071 7.68757 11.1451ZM1.94207 10.9505C2.07037 11.0968 2.25089 11.1871 2.44493 11.2019C2.63898 11.1871 2.81949 11.0968 2.94779 10.9505L6.46779 7.49085C6.60905 7.34942 6.68839 7.15771 6.68839 6.95782C6.68839 6.75793 6.60905 6.56622 6.46779 6.42479L2.94779 2.90479C2.80704 2.83757 2.6489 2.81563 2.49517 2.84201C2.34143 2.86839 2.19965 2.94178 2.08936 3.05207C1.97906 3.16237 1.90567 3.30415 1.8793 3.45788C1.85292 3.61162 1.87485 3.76975 1.94207 3.9105L4.95922 6.92765L1.94207 9.9448C1.81838 10.0831 1.75 10.2621 1.75 10.4477C1.75 10.6332 1.81838 10.8122 1.94207 10.9505Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angledoubleup.mjs
var AngleDoubleUpIcon;
var init_primeng_icons_angledoubleup = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angledoubleup.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleDoubleUpIcon = class _AngleDoubleUpIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleDoubleUpIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleDoubleUpIcon,
        isStandalone: true,
        selector: "AngleDoubleUpIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.1504 6.67719C10.2417 6.71508 10.3396 6.73436 10.4385 6.73389C10.6338 6.74289 10.8249 6.67441 10.97 6.54334C11.1109 6.4023 11.19 6.21112 11.19 6.01178C11.19 5.81245 11.1109 5.62127 10.97 5.48023L7.45977 1.96998C7.31873 1.82912 7.12755 1.75 6.92821 1.75C6.72888 1.75 6.5377 1.82912 6.39666 1.96998L2.9165 5.45014C2.83353 5.58905 2.79755 5.751 2.81392 5.91196C2.83028 6.07293 2.89811 6.22433 3.00734 6.34369C3.11656 6.46306 3.26137 6.54402 3.42025 6.57456C3.57914 6.60511 3.74364 6.5836 3.88934 6.51325L6.89813 3.50446L9.90691 6.51325C9.97636 6.58357 10.0592 6.6393 10.1504 6.67719ZM9.93702 11.9993C10.065 12.1452 10.245 12.2352 10.4385 12.25C10.632 12.2352 10.812 12.1452 10.9399 11.9993C11.0633 11.8614 11.1315 11.6828 11.1315 11.4978C11.1315 11.3128 11.0633 11.1342 10.9399 10.9963L7.48987 7.48609C7.34883 7.34523 7.15765 7.26611 6.95832 7.26611C6.75899 7.26611 6.5678 7.34523 6.42677 7.48609L2.91652 10.9963C2.84948 11.1367 2.82761 11.2944 2.85391 11.4477C2.88022 11.601 2.9534 11.7424 3.06339 11.8524C3.17338 11.9624 3.31477 12.0356 3.46808 12.0619C3.62139 12.0882 3.77908 12.0663 3.91945 11.9993L6.92823 8.99048L9.93702 11.9993Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleDoubleUpIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleDoubleUpIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.1504 6.67719C10.2417 6.71508 10.3396 6.73436 10.4385 6.73389C10.6338 6.74289 10.8249 6.67441 10.97 6.54334C11.1109 6.4023 11.19 6.21112 11.19 6.01178C11.19 5.81245 11.1109 5.62127 10.97 5.48023L7.45977 1.96998C7.31873 1.82912 7.12755 1.75 6.92821 1.75C6.72888 1.75 6.5377 1.82912 6.39666 1.96998L2.9165 5.45014C2.83353 5.58905 2.79755 5.751 2.81392 5.91196C2.83028 6.07293 2.89811 6.22433 3.00734 6.34369C3.11656 6.46306 3.26137 6.54402 3.42025 6.57456C3.57914 6.60511 3.74364 6.5836 3.88934 6.51325L6.89813 3.50446L9.90691 6.51325C9.97636 6.58357 10.0592 6.6393 10.1504 6.67719ZM9.93702 11.9993C10.065 12.1452 10.245 12.2352 10.4385 12.25C10.632 12.2352 10.812 12.1452 10.9399 11.9993C11.0633 11.8614 11.1315 11.6828 11.1315 11.4978C11.1315 11.3128 11.0633 11.1342 10.9399 10.9963L7.48987 7.48609C7.34883 7.34523 7.15765 7.26611 6.95832 7.26611C6.75899 7.26611 6.5678 7.34523 6.42677 7.48609L2.91652 10.9963C2.84948 11.1367 2.82761 11.2944 2.85391 11.4477C2.88022 11.601 2.9534 11.7424 3.06339 11.8524C3.17338 11.9624 3.31477 12.0356 3.46808 12.0619C3.62139 12.0882 3.77908 12.0663 3.91945 11.9993L6.92823 8.99048L9.93702 11.9993Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angledown.mjs
var AngleDownIcon;
var init_primeng_icons_angledown = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angledown.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleDownIcon = class _AngleDownIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleDownIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleDownIcon,
        isStandalone: true,
        selector: "AngleDownIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleDownIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleDownIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angleleft.mjs
var AngleLeftIcon;
var init_primeng_icons_angleleft = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angleleft.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleLeftIcon = class _AngleLeftIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleLeftIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleLeftIcon,
        isStandalone: true,
        selector: "AngleLeftIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M8.75 11.185C8.65146 11.1854 8.55381 11.1662 8.4628 11.1284C8.37179 11.0906 8.28924 11.0351 8.22 10.965L4.72 7.46496C4.57955 7.32433 4.50066 7.13371 4.50066 6.93496C4.50066 6.73621 4.57955 6.54558 4.72 6.40496L8.22 2.93496C8.36095 2.84357 8.52851 2.80215 8.69582 2.81733C8.86312 2.83252 9.02048 2.90344 9.14268 3.01872C9.26487 3.134 9.34483 3.28696 9.36973 3.4531C9.39463 3.61924 9.36303 3.78892 9.28 3.93496L6.28 6.93496L9.28 9.93496C9.42045 10.0756 9.49934 10.2662 9.49934 10.465C9.49934 10.6637 9.42045 10.8543 9.28 10.995C9.13526 11.1257 8.9448 11.1939 8.75 11.185Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleLeftIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleLeftIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M8.75 11.185C8.65146 11.1854 8.55381 11.1662 8.4628 11.1284C8.37179 11.0906 8.28924 11.0351 8.22 10.965L4.72 7.46496C4.57955 7.32433 4.50066 7.13371 4.50066 6.93496C4.50066 6.73621 4.57955 6.54558 4.72 6.40496L8.22 2.93496C8.36095 2.84357 8.52851 2.80215 8.69582 2.81733C8.86312 2.83252 9.02048 2.90344 9.14268 3.01872C9.26487 3.134 9.34483 3.28696 9.36973 3.4531C9.39463 3.61924 9.36303 3.78892 9.28 3.93496L6.28 6.93496L9.28 9.93496C9.42045 10.0756 9.49934 10.2662 9.49934 10.465C9.49934 10.6637 9.42045 10.8543 9.28 10.995C9.13526 11.1257 8.9448 11.1939 8.75 11.185Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angleright.mjs
var AngleRightIcon;
var init_primeng_icons_angleright = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angleright.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleRightIcon = class _AngleRightIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleRightIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleRightIcon,
        isStandalone: true,
        selector: "AngleRightIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M5.25 11.1728C5.14929 11.1694 5.05033 11.1455 4.9592 11.1025C4.86806 11.0595 4.78666 10.9984 4.72 10.9228C4.57955 10.7822 4.50066 10.5916 4.50066 10.3928C4.50066 10.1941 4.57955 10.0035 4.72 9.86283L7.72 6.86283L4.72 3.86283C4.66067 3.71882 4.64765 3.55991 4.68275 3.40816C4.71785 3.25642 4.79932 3.11936 4.91585 3.01602C5.03238 2.91268 5.17819 2.84819 5.33305 2.83149C5.4879 2.81479 5.64411 2.84671 5.78 2.92283L9.28 6.42283C9.42045 6.56346 9.49934 6.75408 9.49934 6.95283C9.49934 7.15158 9.42045 7.34221 9.28 7.48283L5.78 10.9228C5.71333 10.9984 5.63193 11.0595 5.5408 11.1025C5.44966 11.1455 5.35071 11.1694 5.25 11.1728Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleRightIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleRightIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M5.25 11.1728C5.14929 11.1694 5.05033 11.1455 4.9592 11.1025C4.86806 11.0595 4.78666 10.9984 4.72 10.9228C4.57955 10.7822 4.50066 10.5916 4.50066 10.3928C4.50066 10.1941 4.57955 10.0035 4.72 9.86283L7.72 6.86283L4.72 3.86283C4.66067 3.71882 4.64765 3.55991 4.68275 3.40816C4.71785 3.25642 4.79932 3.11936 4.91585 3.01602C5.03238 2.91268 5.17819 2.84819 5.33305 2.83149C5.4879 2.81479 5.64411 2.84671 5.78 2.92283L9.28 6.42283C9.42045 6.56346 9.49934 6.75408 9.49934 6.95283C9.49934 7.15158 9.42045 7.34221 9.28 7.48283L5.78 10.9228C5.71333 10.9984 5.63193 11.0595 5.5408 11.1025C5.44966 11.1455 5.35071 11.1694 5.25 11.1728Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-angleup.mjs
var AngleUpIcon;
var init_primeng_icons_angleup = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-angleup.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    AngleUpIcon = class _AngleUpIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _AngleUpIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _AngleUpIcon,
        isStandalone: true,
        selector: "AngleUpIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: AngleUpIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "AngleUpIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-arrowdown.mjs
var ArrowDownIcon;
var init_primeng_icons_arrowdown = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-arrowdown.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    ArrowDownIcon = class _ArrowDownIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ArrowDownIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ArrowDownIcon,
        isStandalone: true,
        selector: "ArrowDownIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.99994 14C6.91097 14.0004 6.82281 13.983 6.74064 13.9489C6.65843 13.9148 6.58387 13.8646 6.52133 13.8013L1.10198 8.38193C0.982318 8.25351 0.917175 8.08367 0.920272 7.90817C0.923368 7.73267 0.994462 7.56523 1.11858 7.44111C1.24269 7.317 1.41014 7.2459 1.58563 7.2428C1.76113 7.23971 1.93098 7.30485 2.0594 7.42451L6.32263 11.6877V0.677419C6.32263 0.497756 6.394 0.325452 6.52104 0.198411C6.64808 0.0713706 6.82039 0 7.00005 0C7.17971 0 7.35202 0.0713706 7.47906 0.198411C7.6061 0.325452 7.67747 0.497756 7.67747 0.677419V11.6877L11.9407 7.42451C12.0691 7.30485 12.2389 7.23971 12.4144 7.2428C12.5899 7.2459 12.7574 7.317 12.8815 7.44111C13.0056 7.56523 13.0767 7.73267 13.0798 7.90817C13.0829 8.08367 13.0178 8.25351 12.8981 8.38193L7.47875 13.8013C7.41621 13.8646 7.34164 13.9148 7.25944 13.9489C7.17727 13.983 7.08912 14.0004 7.00015 14C7.00012 14 7.00009 14 7.00005 14C7.00001 14 6.99998 14 6.99994 14Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ArrowDownIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ArrowDownIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.99994 14C6.91097 14.0004 6.82281 13.983 6.74064 13.9489C6.65843 13.9148 6.58387 13.8646 6.52133 13.8013L1.10198 8.38193C0.982318 8.25351 0.917175 8.08367 0.920272 7.90817C0.923368 7.73267 0.994462 7.56523 1.11858 7.44111C1.24269 7.317 1.41014 7.2459 1.58563 7.2428C1.76113 7.23971 1.93098 7.30485 2.0594 7.42451L6.32263 11.6877V0.677419C6.32263 0.497756 6.394 0.325452 6.52104 0.198411C6.64808 0.0713706 6.82039 0 7.00005 0C7.17971 0 7.35202 0.0713706 7.47906 0.198411C7.6061 0.325452 7.67747 0.497756 7.67747 0.677419V11.6877L11.9407 7.42451C12.0691 7.30485 12.2389 7.23971 12.4144 7.2428C12.5899 7.2459 12.7574 7.317 12.8815 7.44111C13.0056 7.56523 13.0767 7.73267 13.0798 7.90817C13.0829 8.08367 13.0178 8.25351 12.8981 8.38193L7.47875 13.8013C7.41621 13.8646 7.34164 13.9148 7.25944 13.9489C7.17727 13.983 7.08912 14.0004 7.00015 14C7.00012 14 7.00009 14 7.00005 14C7.00001 14 6.99998 14 6.99994 14Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-arrowdownleft.mjs
var ArrowDownLeftIcon;
var init_primeng_icons_arrowdownleft = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-arrowdownleft.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ArrowDownLeftIcon = class _ArrowDownLeftIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ArrowDownLeftIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ArrowDownLeftIcon,
        isStandalone: true,
        selector: "ArrowDownLeftIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.092 11.9564C10.2662 11.9564 10.4332 11.8875 10.5564 11.7649C10.6796 11.6422 10.7488 11.4759 10.7488 11.3025C10.7488 11.129 10.6796 10.9627 10.5564 10.84C10.4332 10.7174 10.2662 10.6485 10.092 10.6485H4.24193L11.7909 3.13239C11.8555 3.07252 11.9072 3.00033 11.9431 2.92011C11.979 2.83989 11.9983 2.7533 11.9999 2.66549C12.0015 2.57768 11.9852 2.49046 11.9522 2.40904C11.9192 2.32761 11.87 2.25364 11.8076 2.19154C11.7453 2.12944 11.671 2.08049 11.5892 2.0476C11.5074 2.01471 11.4198 1.99855 11.3316 2.0001C11.2434 2.00165 11.1564 2.02087 11.0759 2.05661C10.9953 2.09236 10.9228 2.14389 10.8626 2.20814L3.31363 9.72424V3.8997C3.31363 3.72626 3.24443 3.55992 3.12126 3.43728C2.99808 3.31464 2.83102 3.24574 2.65682 3.24574C2.48262 3.24574 2.31555 3.31464 2.19238 3.43728C2.0692 3.55992 2 3.72626 2 3.8997V11.346C2.00046 11.433 2.01832 11.5189 2.05255 11.5989C2.10343 11.7169 2.18762 11.8175 2.29489 11.8887C2.40217 11.9599 2.5279 11.9986 2.65682 12L10.092 11.9564Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ArrowDownLeftIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ArrowDownLeftIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.092 11.9564C10.2662 11.9564 10.4332 11.8875 10.5564 11.7649C10.6796 11.6422 10.7488 11.4759 10.7488 11.3025C10.7488 11.129 10.6796 10.9627 10.5564 10.84C10.4332 10.7174 10.2662 10.6485 10.092 10.6485H4.24193L11.7909 3.13239C11.8555 3.07252 11.9072 3.00033 11.9431 2.92011C11.979 2.83989 11.9983 2.7533 11.9999 2.66549C12.0015 2.57768 11.9852 2.49046 11.9522 2.40904C11.9192 2.32761 11.87 2.25364 11.8076 2.19154C11.7453 2.12944 11.671 2.08049 11.5892 2.0476C11.5074 2.01471 11.4198 1.99855 11.3316 2.0001C11.2434 2.00165 11.1564 2.02087 11.0759 2.05661C10.9953 2.09236 10.9228 2.14389 10.8626 2.20814L3.31363 9.72424V3.8997C3.31363 3.72626 3.24443 3.55992 3.12126 3.43728C2.99808 3.31464 2.83102 3.24574 2.65682 3.24574C2.48262 3.24574 2.31555 3.31464 2.19238 3.43728C2.0692 3.55992 2 3.72626 2 3.8997V11.346C2.00046 11.433 2.01832 11.5189 2.05255 11.5989C2.10343 11.7169 2.18762 11.8175 2.29489 11.8887C2.40217 11.9599 2.5279 11.9986 2.65682 12L10.092 11.9564Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-arrowdownright.mjs
var ArrowDownRightIcon;
var init_primeng_icons_arrowdownright = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-arrowdownright.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ArrowDownRightIcon = class _ArrowDownRightIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ArrowDownRightIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ArrowDownRightIcon,
        isStandalone: true,
        selector: "ArrowDownRightIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M12 3.88141C12 3.70664 11.9306 3.53903 11.807 3.41545C11.6834 3.29187 11.5158 3.22244 11.341 3.22244C11.1662 3.22244 10.9986 3.29187 10.875 3.41545C10.7515 3.53903 10.682 3.70664 10.682 3.88141V9.75069L3.1082 2.17686C2.98328 2.06046 2.81806 1.99709 2.64734 2.0001C2.47662 2.00311 2.31373 2.07227 2.19299 2.19301C2.07226 2.31375 2.0031 2.47663 2.00009 2.64735C1.99708 2.81807 2.06045 2.9833 2.17685 3.10821L9.75068 10.682H3.8814C3.70663 10.682 3.53901 10.7515 3.41543 10.8751C3.29185 10.9986 3.22242 11.1663 3.22242 11.341C3.22242 11.5158 3.29185 11.6834 3.41543 11.807C3.53901 11.9306 3.70663 12 3.8814 12H11.3849C11.4725 11.9995 11.5592 11.9816 11.6397 11.9473C11.7439 11.8934 11.832 11.8131 11.8952 11.7144C11.9584 11.6157 11.9946 11.5021 12 11.385V3.88141Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ArrowDownRightIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ArrowDownRightIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M12 3.88141C12 3.70664 11.9306 3.53903 11.807 3.41545C11.6834 3.29187 11.5158 3.22244 11.341 3.22244C11.1662 3.22244 10.9986 3.29187 10.875 3.41545C10.7515 3.53903 10.682 3.70664 10.682 3.88141V9.75069L3.1082 2.17686C2.98328 2.06046 2.81806 1.99709 2.64734 2.0001C2.47662 2.00311 2.31373 2.07227 2.19299 2.19301C2.07226 2.31375 2.0031 2.47663 2.00009 2.64735C1.99708 2.81807 2.06045 2.9833 2.17685 3.10821L9.75068 10.682H3.8814C3.70663 10.682 3.53901 10.7515 3.41543 10.8751C3.29185 10.9986 3.22242 11.1663 3.22242 11.341C3.22242 11.5158 3.29185 11.6834 3.41543 11.807C3.53901 11.9306 3.70663 12 3.8814 12H11.3849C11.4725 11.9995 11.5592 11.9816 11.6397 11.9473C11.7439 11.8934 11.832 11.8131 11.8952 11.7144C11.9584 11.6157 11.9946 11.5021 12 11.385V3.88141Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-arrowleft.mjs
var ArrowLeftIcon;
var init_primeng_icons_arrowleft = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-arrowleft.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    ArrowLeftIcon = class _ArrowLeftIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ArrowLeftIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ArrowLeftIcon,
        isStandalone: true,
        selector: "ArrowLeftIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.83743 13.0373C5.91964 13.0714 6.00783 13.0887 6.09683 13.0883C6.18584 13.0887 6.27403 13.0714 6.35623 13.0373C6.43844 13.0031 6.513 12.9529 6.57554 12.8896C6.7024 12.7626 6.77366 12.5904 6.77366 12.4109C6.77366 12.2314 6.7024 12.0592 6.57554 11.9322L2.31232 7.66896H13.3226C13.5022 7.66896 13.6745 7.59759 13.8016 7.47055C13.9286 7.34351 14 7.17121 14 6.99154C14 6.81188 13.9286 6.63958 13.8016 6.51254C13.6745 6.3855 13.5022 6.31413 13.3226 6.31413H2.31232L6.57554 2.0509C6.6952 1.92248 6.76035 1.75263 6.75725 1.57714C6.75415 1.40164 6.68306 1.23419 6.55894 1.11008C6.43483 0.985963 6.26738 0.914869 6.09189 0.911772C5.91639 0.908676 5.74654 0.973819 5.61812 1.09348L0.216461 6.49514C0.210349 6.50082 0.204331 6.50662 0.198411 6.51254C0.0713707 6.63958 0 6.81188 0 6.99154C0 7.17121 0.0713707 7.34351 0.198411 7.47055C0.20434 7.47648 0.210366 7.48229 0.216488 7.48797L5.61812 12.8896C5.68067 12.9529 5.75523 13.0031 5.83743 13.0373Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ArrowLeftIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ArrowLeftIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.83743 13.0373C5.91964 13.0714 6.00783 13.0887 6.09683 13.0883C6.18584 13.0887 6.27403 13.0714 6.35623 13.0373C6.43844 13.0031 6.513 12.9529 6.57554 12.8896C6.7024 12.7626 6.77366 12.5904 6.77366 12.4109C6.77366 12.2314 6.7024 12.0592 6.57554 11.9322L2.31232 7.66896H13.3226C13.5022 7.66896 13.6745 7.59759 13.8016 7.47055C13.9286 7.34351 14 7.17121 14 6.99154C14 6.81188 13.9286 6.63958 13.8016 6.51254C13.6745 6.3855 13.5022 6.31413 13.3226 6.31413H2.31232L6.57554 2.0509C6.6952 1.92248 6.76035 1.75263 6.75725 1.57714C6.75415 1.40164 6.68306 1.23419 6.55894 1.11008C6.43483 0.985963 6.26738 0.914869 6.09189 0.911772C5.91639 0.908676 5.74654 0.973819 5.61812 1.09348L0.216461 6.49514C0.210349 6.50082 0.204331 6.50662 0.198411 6.51254C0.0713707 6.63958 0 6.81188 0 6.99154C0 7.17121 0.0713707 7.34351 0.198411 7.47055C0.20434 7.47648 0.210366 7.48229 0.216488 7.48797L5.61812 12.8896C5.68067 12.9529 5.75523 13.0031 5.83743 13.0373Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-arrowright.mjs
var ArrowRightIcon;
var init_primeng_icons_arrowright = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-arrowright.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ArrowRightIcon = class _ArrowRightIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ArrowRightIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ArrowRightIcon,
        isStandalone: true,
        selector: "ArrowRightIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.64383 13.1256C7.72604 13.1597 7.81423 13.1771 7.90323 13.1767C7.99224 13.1771 8.08043 13.1597 8.16263 13.1256C8.24484 13.0915 8.3194 13.0413 8.38194 12.9779L13.7845 7.57541C13.7903 7.57001 13.796 7.5645 13.8016 7.55889C13.9286 7.43184 14 7.25954 14 7.07988C14 6.90021 13.9286 6.72791 13.8016 6.60087C13.796 6.59526 13.7903 6.58976 13.7845 6.58438L8.38194 1.18181C8.25353 1.06215 8.08368 0.997009 7.90818 1.00011C7.73268 1.0032 7.56524 1.0743 7.44112 1.19841C7.31701 1.32253 7.24591 1.48997 7.24282 1.66547C7.23972 1.84097 7.30486 2.01082 7.42452 2.13923L11.6878 6.40246H0.677419C0.497757 6.40246 0.325452 6.47383 0.198411 6.60087C0.0713707 6.72791 0 6.90021 0 7.07988C0 7.25954 0.0713707 7.43184 0.198411 7.55889C0.325452 7.68593 0.497757 7.7573 0.677419 7.7573H11.6877L7.42452 12.0205C7.29767 12.1475 7.22641 12.3197 7.22641 12.4992C7.22641 12.6787 7.29767 12.8509 7.42452 12.9779C7.48707 13.0413 7.56163 13.0915 7.64383 13.1256Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ArrowRightIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ArrowRightIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.64383 13.1256C7.72604 13.1597 7.81423 13.1771 7.90323 13.1767C7.99224 13.1771 8.08043 13.1597 8.16263 13.1256C8.24484 13.0915 8.3194 13.0413 8.38194 12.9779L13.7845 7.57541C13.7903 7.57001 13.796 7.5645 13.8016 7.55889C13.9286 7.43184 14 7.25954 14 7.07988C14 6.90021 13.9286 6.72791 13.8016 6.60087C13.796 6.59526 13.7903 6.58976 13.7845 6.58438L8.38194 1.18181C8.25353 1.06215 8.08368 0.997009 7.90818 1.00011C7.73268 1.0032 7.56524 1.0743 7.44112 1.19841C7.31701 1.32253 7.24591 1.48997 7.24282 1.66547C7.23972 1.84097 7.30486 2.01082 7.42452 2.13923L11.6878 6.40246H0.677419C0.497757 6.40246 0.325452 6.47383 0.198411 6.60087C0.0713707 6.72791 0 6.90021 0 7.07988C0 7.25954 0.0713707 7.43184 0.198411 7.55889C0.325452 7.68593 0.497757 7.7573 0.677419 7.7573H11.6877L7.42452 12.0205C7.29767 12.1475 7.22641 12.3197 7.22641 12.4992C7.22641 12.6787 7.29767 12.8509 7.42452 12.9779C7.48707 13.0413 7.56163 13.0915 7.64383 13.1256Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-arrowup.mjs
var ArrowUpIcon;
var init_primeng_icons_arrowup = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-arrowup.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    ArrowUpIcon = class _ArrowUpIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ArrowUpIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ArrowUpIcon,
        isStandalone: true,
        selector: "ArrowUpIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.51551 13.799C6.64205 13.9255 6.813 13.9977 6.99193 14C7.17087 13.9977 7.34182 13.9255 7.46835 13.799C7.59489 13.6725 7.66701 13.5015 7.66935 13.3226V2.31233L11.9326 6.57554C11.9951 6.63887 12.0697 6.68907 12.1519 6.72319C12.2341 6.75731 12.3223 6.77467 12.4113 6.77425C12.5003 6.77467 12.5885 6.75731 12.6707 6.72319C12.7529 6.68907 12.8274 6.63887 12.89 6.57554C13.0168 6.44853 13.0881 6.27635 13.0881 6.09683C13.0881 5.91732 13.0168 5.74514 12.89 5.61812L7.48846 0.216594C7.48274 0.210436 7.4769 0.204374 7.47094 0.198411C7.3439 0.0713707 7.1716 0 6.99193 0C6.81227 0 6.63997 0.0713707 6.51293 0.198411C6.50704 0.204296 6.50128 0.210278 6.49563 0.216354L1.09386 5.61812C0.974201 5.74654 0.909057 5.91639 0.912154 6.09189C0.91525 6.26738 0.986345 6.43483 1.11046 6.55894C1.23457 6.68306 1.40202 6.75415 1.57752 6.75725C1.75302 6.76035 1.92286 6.6952 2.05128 6.57554L6.31451 2.31231V13.3226C6.31685 13.5015 6.38898 13.6725 6.51551 13.799Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ArrowUpIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ArrowUpIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.51551 13.799C6.64205 13.9255 6.813 13.9977 6.99193 14C7.17087 13.9977 7.34182 13.9255 7.46835 13.799C7.59489 13.6725 7.66701 13.5015 7.66935 13.3226V2.31233L11.9326 6.57554C11.9951 6.63887 12.0697 6.68907 12.1519 6.72319C12.2341 6.75731 12.3223 6.77467 12.4113 6.77425C12.5003 6.77467 12.5885 6.75731 12.6707 6.72319C12.7529 6.68907 12.8274 6.63887 12.89 6.57554C13.0168 6.44853 13.0881 6.27635 13.0881 6.09683C13.0881 5.91732 13.0168 5.74514 12.89 5.61812L7.48846 0.216594C7.48274 0.210436 7.4769 0.204374 7.47094 0.198411C7.3439 0.0713707 7.1716 0 6.99193 0C6.81227 0 6.63997 0.0713707 6.51293 0.198411C6.50704 0.204296 6.50128 0.210278 6.49563 0.216354L1.09386 5.61812C0.974201 5.74654 0.909057 5.91639 0.912154 6.09189C0.91525 6.26738 0.986345 6.43483 1.11046 6.55894C1.23457 6.68306 1.40202 6.75415 1.57752 6.75725C1.75302 6.76035 1.92286 6.6952 2.05128 6.57554L6.31451 2.31231V13.3226C6.31685 13.5015 6.38898 13.6725 6.51551 13.799Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-ban.mjs
var BanIcon;
var init_primeng_icons_ban = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-ban.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    BanIcon = class _BanIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BanIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _BanIcon,
        isStandalone: true,
        selector: "BanIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M7 0C5.61553 0 4.26215 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32122C0.00303296 5.6003 -0.13559 7.00776 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73785 14 8.38447 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0ZM1.16667 7C1.16549 5.65478 1.63303 4.35118 2.48889 3.31333L10.6867 11.5111C9.83309 12.2112 8.79816 12.6544 7.70243 12.789C6.60669 12.9236 5.49527 12.744 4.49764 12.2713C3.50001 11.7986 2.65724 11.0521 2.06751 10.1188C1.47778 9.18558 1.16537 8.10397 1.16667 7ZM11.5111 10.6867L3.31334 2.48889C4.43144 1.57388 5.84966 1.10701 7.29265 1.1789C8.73565 1.2508 10.1004 1.85633 11.1221 2.87795C12.1437 3.89956 12.7492 5.26435 12.8211 6.70735C12.893 8.15034 12.4261 9.56856 11.5111 10.6867Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BanIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "BanIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M7 0C5.61553 0 4.26215 0.410543 3.11101 1.17971C1.95987 1.94888 1.06266 3.04213 0.532846 4.32122C0.00303296 5.6003 -0.13559 7.00776 0.134506 8.36563C0.404603 9.7235 1.07129 10.9708 2.05026 11.9497C3.02922 12.9287 4.2765 13.5954 5.63437 13.8655C6.99224 14.1356 8.3997 13.997 9.67879 13.4672C10.9579 12.9373 12.0511 12.0401 12.8203 10.889C13.5895 9.73785 14 8.38447 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0ZM1.16667 7C1.16549 5.65478 1.63303 4.35118 2.48889 3.31333L10.6867 11.5111C9.83309 12.2112 8.79816 12.6544 7.70243 12.789C6.60669 12.9236 5.49527 12.744 4.49764 12.2713C3.50001 11.7986 2.65724 11.0521 2.06751 10.1188C1.47778 9.18558 1.16537 8.10397 1.16667 7ZM11.5111 10.6867L3.31334 2.48889C4.43144 1.57388 5.84966 1.10701 7.29265 1.1789C8.73565 1.2508 10.1004 1.85633 11.1221 2.87795C12.1437 3.89956 12.7492 5.26435 12.8211 6.70735C12.893 8.15034 12.4261 9.56856 11.5111 10.6867Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-bars.mjs
var BarsIcon;
var init_primeng_icons_bars = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-bars.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    BarsIcon = class _BarsIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BarsIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _BarsIcon,
        isStandalone: true,
        selector: "BarsIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M13.3226 3.6129H0.677419C0.497757 3.6129 0.325452 3.54152 0.198411 3.41448C0.0713707 3.28744 0 3.11514 0 2.93548C0 2.75581 0.0713707 2.58351 0.198411 2.45647C0.325452 2.32943 0.497757 2.25806 0.677419 2.25806H13.3226C13.5022 2.25806 13.6745 2.32943 13.8016 2.45647C13.9286 2.58351 14 2.75581 14 2.93548C14 3.11514 13.9286 3.28744 13.8016 3.41448C13.6745 3.54152 13.5022 3.6129 13.3226 3.6129ZM13.3226 7.67741H0.677419C0.497757 7.67741 0.325452 7.60604 0.198411 7.479C0.0713707 7.35196 0 7.17965 0 6.99999C0 6.82033 0.0713707 6.64802 0.198411 6.52098C0.325452 6.39394 0.497757 6.32257 0.677419 6.32257H13.3226C13.5022 6.32257 13.6745 6.39394 13.8016 6.52098C13.9286 6.64802 14 6.82033 14 6.99999C14 7.17965 13.9286 7.35196 13.8016 7.479C13.6745 7.60604 13.5022 7.67741 13.3226 7.67741ZM0.677419 11.7419H13.3226C13.5022 11.7419 13.6745 11.6706 13.8016 11.5435C13.9286 11.4165 14 11.2442 14 11.0645C14 10.8848 13.9286 10.7125 13.8016 10.5855C13.6745 10.4585 13.5022 10.3871 13.3226 10.3871H0.677419C0.497757 10.3871 0.325452 10.4585 0.198411 10.5855C0.0713707 10.7125 0 10.8848 0 11.0645C0 11.2442 0.0713707 11.4165 0.198411 11.5435C0.325452 11.6706 0.497757 11.7419 0.677419 11.7419Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BarsIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "BarsIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M13.3226 3.6129H0.677419C0.497757 3.6129 0.325452 3.54152 0.198411 3.41448C0.0713707 3.28744 0 3.11514 0 2.93548C0 2.75581 0.0713707 2.58351 0.198411 2.45647C0.325452 2.32943 0.497757 2.25806 0.677419 2.25806H13.3226C13.5022 2.25806 13.6745 2.32943 13.8016 2.45647C13.9286 2.58351 14 2.75581 14 2.93548C14 3.11514 13.9286 3.28744 13.8016 3.41448C13.6745 3.54152 13.5022 3.6129 13.3226 3.6129ZM13.3226 7.67741H0.677419C0.497757 7.67741 0.325452 7.60604 0.198411 7.479C0.0713707 7.35196 0 7.17965 0 6.99999C0 6.82033 0.0713707 6.64802 0.198411 6.52098C0.325452 6.39394 0.497757 6.32257 0.677419 6.32257H13.3226C13.5022 6.32257 13.6745 6.39394 13.8016 6.52098C13.9286 6.64802 14 6.82033 14 6.99999C14 7.17965 13.9286 7.35196 13.8016 7.479C13.6745 7.60604 13.5022 7.67741 13.3226 7.67741ZM0.677419 11.7419H13.3226C13.5022 11.7419 13.6745 11.6706 13.8016 11.5435C13.9286 11.4165 14 11.2442 14 11.0645C14 10.8848 13.9286 10.7125 13.8016 10.5855C13.6745 10.4585 13.5022 10.3871 13.3226 10.3871H0.677419C0.497757 10.3871 0.325452 10.4585 0.198411 10.5855C0.0713707 10.7125 0 10.8848 0 11.0645C0 11.2442 0.0713707 11.4165 0.198411 11.5435C0.325452 11.6706 0.497757 11.7419 0.677419 11.7419Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-blank.mjs
var BlankIcon;
var init_primeng_icons_blank = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-blank.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    BlankIcon = class _BlankIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _BlankIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _BlankIcon,
        isStandalone: true,
        selector: "BlankIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="1" fill="currentColor" fill-opacity="0" />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: BlankIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "BlankIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="1" fill="currentColor" fill-opacity="0" />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-calendar.mjs
var CalendarIcon;
var init_primeng_icons_calendar = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-calendar.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    CalendarIcon = class _CalendarIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _CalendarIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _CalendarIcon,
        isStandalone: true,
        selector: "CalendarIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.7838 1.51351H9.83783V0.567568C9.83783 0.417039 9.77804 0.272676 9.6716 0.166237C9.56516 0.0597971 9.42079 0 9.27027 0C9.11974 0 8.97538 0.0597971 8.86894 0.166237C8.7625 0.272676 8.7027 0.417039 8.7027 0.567568V1.51351H5.29729V0.567568C5.29729 0.417039 5.2375 0.272676 5.13106 0.166237C5.02462 0.0597971 4.88025 0 4.72973 0C4.5792 0 4.43484 0.0597971 4.3284 0.166237C4.22196 0.272676 4.16216 0.417039 4.16216 0.567568V1.51351H3.21621C2.66428 1.51351 2.13494 1.73277 1.74467 2.12305C1.35439 2.51333 1.13513 3.04266 1.13513 3.59459V11.9189C1.13513 12.4709 1.35439 13.0002 1.74467 13.3905C2.13494 13.7807 2.66428 14 3.21621 14H10.7838C11.3357 14 11.865 13.7807 12.2553 13.3905C12.6456 13.0002 12.8649 12.4709 12.8649 11.9189V3.59459C12.8649 3.04266 12.6456 2.51333 12.2553 2.12305C11.865 1.73277 11.3357 1.51351 10.7838 1.51351ZM3.21621 2.64865H4.16216V3.59459C4.16216 3.74512 4.22196 3.88949 4.3284 3.99593C4.43484 4.10237 4.5792 4.16216 4.72973 4.16216C4.88025 4.16216 5.02462 4.10237 5.13106 3.99593C5.2375 3.88949 5.29729 3.74512 5.29729 3.59459V2.64865H8.7027V3.59459C8.7027 3.74512 8.7625 3.88949 8.86894 3.99593C8.97538 4.10237 9.11974 4.16216 9.27027 4.16216C9.42079 4.16216 9.56516 4.10237 9.6716 3.99593C9.77804 3.88949 9.83783 3.74512 9.83783 3.59459V2.64865H10.7838C11.0347 2.64865 11.2753 2.74831 11.4527 2.92571C11.6301 3.10311 11.7297 3.34371 11.7297 3.59459V5.67568H2.27027V3.59459C2.27027 3.34371 2.36993 3.10311 2.54733 2.92571C2.72473 2.74831 2.96533 2.64865 3.21621 2.64865ZM10.7838 12.8649H3.21621C2.96533 12.8649 2.72473 12.7652 2.54733 12.5878C2.36993 12.4104 2.27027 12.1698 2.27027 11.9189V6.81081H11.7297V11.9189C11.7297 12.1698 11.6301 12.4104 11.4527 12.5878C11.2753 12.7652 11.0347 12.8649 10.7838 12.8649Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: CalendarIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "CalendarIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.7838 1.51351H9.83783V0.567568C9.83783 0.417039 9.77804 0.272676 9.6716 0.166237C9.56516 0.0597971 9.42079 0 9.27027 0C9.11974 0 8.97538 0.0597971 8.86894 0.166237C8.7625 0.272676 8.7027 0.417039 8.7027 0.567568V1.51351H5.29729V0.567568C5.29729 0.417039 5.2375 0.272676 5.13106 0.166237C5.02462 0.0597971 4.88025 0 4.72973 0C4.5792 0 4.43484 0.0597971 4.3284 0.166237C4.22196 0.272676 4.16216 0.417039 4.16216 0.567568V1.51351H3.21621C2.66428 1.51351 2.13494 1.73277 1.74467 2.12305C1.35439 2.51333 1.13513 3.04266 1.13513 3.59459V11.9189C1.13513 12.4709 1.35439 13.0002 1.74467 13.3905C2.13494 13.7807 2.66428 14 3.21621 14H10.7838C11.3357 14 11.865 13.7807 12.2553 13.3905C12.6456 13.0002 12.8649 12.4709 12.8649 11.9189V3.59459C12.8649 3.04266 12.6456 2.51333 12.2553 2.12305C11.865 1.73277 11.3357 1.51351 10.7838 1.51351ZM3.21621 2.64865H4.16216V3.59459C4.16216 3.74512 4.22196 3.88949 4.3284 3.99593C4.43484 4.10237 4.5792 4.16216 4.72973 4.16216C4.88025 4.16216 5.02462 4.10237 5.13106 3.99593C5.2375 3.88949 5.29729 3.74512 5.29729 3.59459V2.64865H8.7027V3.59459C8.7027 3.74512 8.7625 3.88949 8.86894 3.99593C8.97538 4.10237 9.11974 4.16216 9.27027 4.16216C9.42079 4.16216 9.56516 4.10237 9.6716 3.99593C9.77804 3.88949 9.83783 3.74512 9.83783 3.59459V2.64865H10.7838C11.0347 2.64865 11.2753 2.74831 11.4527 2.92571C11.6301 3.10311 11.7297 3.34371 11.7297 3.59459V5.67568H2.27027V3.59459C2.27027 3.34371 2.36993 3.10311 2.54733 2.92571C2.72473 2.74831 2.96533 2.64865 3.21621 2.64865ZM10.7838 12.8649H3.21621C2.96533 12.8649 2.72473 12.7652 2.54733 12.5878C2.36993 12.4104 2.27027 12.1698 2.27027 11.9189V6.81081H11.7297V11.9189C11.7297 12.1698 11.6301 12.4104 11.4527 12.5878C11.2753 12.7652 11.0347 12.8649 10.7838 12.8649Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-caretleft.mjs
var CaretLeftIcon;
var init_primeng_icons_caretleft = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-caretleft.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    CaretLeftIcon = class _CaretLeftIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _CaretLeftIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _CaretLeftIcon,
        isStandalone: true,
        selector: "CaretLeftIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.5553 13C10.411 13.0006 10.2704 12.9538 10.1554 12.8667L3.04473 7.53369C2.96193 7.4716 2.89474 7.39108 2.84845 7.29852C2.80217 7.20595 2.77808 7.10388 2.77808 7.00039C2.77808 6.8969 2.80217 6.79484 2.84845 6.70227C2.89474 6.60971 2.96193 6.52919 3.04473 6.4671L10.1554 1.13412C10.2549 1.05916 10.3734 1.0136 10.4976 1.0026C10.6217 0.991605 10.7464 1.01561 10.8575 1.0719C10.9668 1.12856 11.0584 1.21398 11.1226 1.31893C11.1869 1.42388 11.2212 1.54438 11.222 1.66742V12.3334C11.2212 12.4564 11.1869 12.5769 11.1226 12.6819C11.0584 12.7868 10.9668 12.8722 10.8575 12.9289C10.7629 12.9735 10.6599 12.9977 10.5553 13ZM4.55574 7.00039L9.88871 11.0001V3.00066L4.55574 7.00039Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: CaretLeftIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "CaretLeftIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M10.5553 13C10.411 13.0006 10.2704 12.9538 10.1554 12.8667L3.04473 7.53369C2.96193 7.4716 2.89474 7.39108 2.84845 7.29852C2.80217 7.20595 2.77808 7.10388 2.77808 7.00039C2.77808 6.8969 2.80217 6.79484 2.84845 6.70227C2.89474 6.60971 2.96193 6.52919 3.04473 6.4671L10.1554 1.13412C10.2549 1.05916 10.3734 1.0136 10.4976 1.0026C10.6217 0.991605 10.7464 1.01561 10.8575 1.0719C10.9668 1.12856 11.0584 1.21398 11.1226 1.31893C11.1869 1.42388 11.2212 1.54438 11.222 1.66742V12.3334C11.2212 12.4564 11.1869 12.5769 11.1226 12.6819C11.0584 12.7868 10.9668 12.8722 10.8575 12.9289C10.7629 12.9735 10.6599 12.9977 10.5553 13ZM4.55574 7.00039L9.88871 11.0001V3.00066L4.55574 7.00039Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-caretright.mjs
var CaretRightIcon;
var init_primeng_icons_caretright = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-caretright.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    CaretRightIcon = class _CaretRightIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _CaretRightIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _CaretRightIcon,
        isStandalone: true,
        selector: "CaretRightIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M3.44433 13C3.34244 12.9987 3.24216 12.9744 3.15099 12.9289C3.03947 12.8742 2.94542 12.7895 2.87945 12.6843C2.81349 12.5791 2.77823 12.4575 2.77765 12.3333V1.66633C2.77823 1.54214 2.81349 1.42057 2.87945 1.31534C2.94542 1.21011 3.03947 1.1254 3.15099 1.07076C3.26082 1.01524 3.38401 0.991634 3.50658 1.00263C3.62914 1.01363 3.74617 1.05879 3.84435 1.13298L10.9557 6.46647C11.0385 6.52857 11.1057 6.6091 11.152 6.70167C11.1982 6.79424 11.2223 6.89632 11.2223 6.99982C11.2223 7.10332 11.1982 7.2054 11.152 7.29797C11.1057 7.39054 11.0385 7.47107 10.9557 7.53317L3.84435 12.8667C3.72925 12.9538 3.58869 13.0006 3.44433 13ZM4.11102 2.9997V10.9999L9.44451 6.99982L4.11102 2.9997Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: CaretRightIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "CaretRightIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M3.44433 13C3.34244 12.9987 3.24216 12.9744 3.15099 12.9289C3.03947 12.8742 2.94542 12.7895 2.87945 12.6843C2.81349 12.5791 2.77823 12.4575 2.77765 12.3333V1.66633C2.77823 1.54214 2.81349 1.42057 2.87945 1.31534C2.94542 1.21011 3.03947 1.1254 3.15099 1.07076C3.26082 1.01524 3.38401 0.991634 3.50658 1.00263C3.62914 1.01363 3.74617 1.05879 3.84435 1.13298L10.9557 6.46647C11.0385 6.52857 11.1057 6.6091 11.152 6.70167C11.1982 6.79424 11.2223 6.89632 11.2223 6.99982C11.2223 7.10332 11.1982 7.2054 11.152 7.29797C11.1057 7.39054 11.0385 7.47107 10.9557 7.53317L3.84435 12.8667C3.72925 12.9538 3.58869 13.0006 3.44433 13ZM4.11102 2.9997V10.9999L9.44451 6.99982L4.11102 2.9997Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-check.mjs
var CheckIcon;
var init_primeng_icons_check = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-check.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    CheckIcon = class _CheckIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _CheckIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _CheckIcon,
        isStandalone: true,
        selector: "CheckIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: CheckIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "CheckIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-chevrondown.mjs
var ChevronDownIcon;
var init_primeng_icons_chevrondown = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-chevrondown.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ChevronDownIcon = class _ChevronDownIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ChevronDownIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ChevronDownIcon,
        isStandalone: true,
        selector: "ChevronDownIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ChevronDownIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ChevronDownIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-chevronleft.mjs
var ChevronLeftIcon;
var init_primeng_icons_chevronleft = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-chevronleft.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ChevronLeftIcon = class _ChevronLeftIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ChevronLeftIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ChevronLeftIcon,
        isStandalone: true,
        selector: "ChevronLeftIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ChevronLeftIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ChevronLeftIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-chevronright.mjs
var ChevronRightIcon;
var init_primeng_icons_chevronright = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-chevronright.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ChevronRightIcon = class _ChevronRightIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ChevronRightIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ChevronRightIcon,
        isStandalone: true,
        selector: "ChevronRightIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ChevronRightIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ChevronRightIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-chevronup.mjs
var ChevronUpIcon;
var init_primeng_icons_chevronup = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-chevronup.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    ChevronUpIcon = class _ChevronUpIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ChevronUpIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ChevronUpIcon,
        isStandalone: true,
        selector: "ChevronUpIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M12.2097 10.4113C12.1057 10.4118 12.0027 10.3915 11.9067 10.3516C11.8107 10.3118 11.7237 10.2532 11.6506 10.1792L6.93602 5.46461L2.22139 10.1476C2.07272 10.244 1.89599 10.2877 1.71953 10.2717C1.54307 10.2556 1.3771 10.1808 1.24822 10.0593C1.11933 9.93766 1.035 9.77633 1.00874 9.6011C0.982477 9.42587 1.0158 9.2469 1.10338 9.09287L6.37701 3.81923C6.52533 3.6711 6.72639 3.58789 6.93602 3.58789C7.14565 3.58789 7.3467 3.6711 7.49502 3.81923L12.7687 9.09287C12.9168 9.24119 13 9.44225 13 9.65187C13 9.8615 12.9168 10.0626 12.7687 10.2109C12.616 10.3487 12.4151 10.4207 12.2097 10.4113Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ChevronUpIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ChevronUpIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M12.2097 10.4113C12.1057 10.4118 12.0027 10.3915 11.9067 10.3516C11.8107 10.3118 11.7237 10.2532 11.6506 10.1792L6.93602 5.46461L2.22139 10.1476C2.07272 10.244 1.89599 10.2877 1.71953 10.2717C1.54307 10.2556 1.3771 10.1808 1.24822 10.0593C1.11933 9.93766 1.035 9.77633 1.00874 9.6011C0.982477 9.42587 1.0158 9.2469 1.10338 9.09287L6.37701 3.81923C6.52533 3.6711 6.72639 3.58789 6.93602 3.58789C7.14565 3.58789 7.3467 3.6711 7.49502 3.81923L12.7687 9.09287C12.9168 9.24119 13 9.44225 13 9.65187C13 9.8615 12.9168 10.0626 12.7687 10.2109C12.616 10.3487 12.4151 10.4207 12.2097 10.4113Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-exclamationtriangle.mjs
var ExclamationTriangleIcon;
var init_primeng_icons_exclamationtriangle = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-exclamationtriangle.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    ExclamationTriangleIcon = class _ExclamationTriangleIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ExclamationTriangleIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ExclamationTriangleIcon,
        isStandalone: true,
        selector: "ExclamationTriangleIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M13.4018 13.1893H0.598161C0.49329 13.189 0.390283 13.1615 0.299143 13.1097C0.208003 13.0578 0.131826 12.9832 0.0780112 12.8932C0.0268539 12.8015 0 12.6982 0 12.5931C0 12.4881 0.0268539 12.3848 0.0780112 12.293L6.47985 1.08982C6.53679 1.00399 6.61408 0.933574 6.70484 0.884867C6.7956 0.836159 6.897 0.810669 7 0.810669C7.103 0.810669 7.2044 0.836159 7.29516 0.884867C7.38592 0.933574 7.46321 1.00399 7.52015 1.08982L13.922 12.293C13.9731 12.3848 14 12.4881 14 12.5931C14 12.6982 13.9731 12.8015 13.922 12.8932C13.8682 12.9832 13.792 13.0578 13.7009 13.1097C13.6097 13.1615 13.5067 13.189 13.4018 13.1893ZM1.63046 11.989H12.3695L7 2.59425L1.63046 11.989Z"
                    fill="currentColor"
                />
                <path
                    d="M6.99996 8.78801C6.84143 8.78594 6.68997 8.72204 6.57787 8.60993C6.46576 8.49782 6.40186 8.34637 6.39979 8.18784V5.38703C6.39979 5.22786 6.46302 5.0752 6.57557 4.96265C6.68813 4.85009 6.84078 4.78686 6.99996 4.78686C7.15914 4.78686 7.31179 4.85009 7.42435 4.96265C7.5369 5.0752 7.60013 5.22786 7.60013 5.38703V8.18784C7.59806 8.34637 7.53416 8.49782 7.42205 8.60993C7.30995 8.72204 7.15849 8.78594 6.99996 8.78801Z"
                    fill="currentColor"
                />
                <path
                    d="M6.99996 11.1887C6.84143 11.1866 6.68997 11.1227 6.57787 11.0106C6.46576 10.8985 6.40186 10.7471 6.39979 10.5885V10.1884C6.39979 10.0292 6.46302 9.87658 6.57557 9.76403C6.68813 9.65147 6.84078 9.58824 6.99996 9.58824C7.15914 9.58824 7.31179 9.65147 7.42435 9.76403C7.5369 9.87658 7.60013 10.0292 7.60013 10.1884V10.5885C7.59806 10.7471 7.53416 10.8985 7.42205 11.0106C7.30995 11.1227 7.15849 11.1866 6.99996 11.1887Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ExclamationTriangleIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ExclamationTriangleIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M13.4018 13.1893H0.598161C0.49329 13.189 0.390283 13.1615 0.299143 13.1097C0.208003 13.0578 0.131826 12.9832 0.0780112 12.8932C0.0268539 12.8015 0 12.6982 0 12.5931C0 12.4881 0.0268539 12.3848 0.0780112 12.293L6.47985 1.08982C6.53679 1.00399 6.61408 0.933574 6.70484 0.884867C6.7956 0.836159 6.897 0.810669 7 0.810669C7.103 0.810669 7.2044 0.836159 7.29516 0.884867C7.38592 0.933574 7.46321 1.00399 7.52015 1.08982L13.922 12.293C13.9731 12.3848 14 12.4881 14 12.5931C14 12.6982 13.9731 12.8015 13.922 12.8932C13.8682 12.9832 13.792 13.0578 13.7009 13.1097C13.6097 13.1615 13.5067 13.189 13.4018 13.1893ZM1.63046 11.989H12.3695L7 2.59425L1.63046 11.989Z"
                    fill="currentColor"
                />
                <path
                    d="M6.99996 8.78801C6.84143 8.78594 6.68997 8.72204 6.57787 8.60993C6.46576 8.49782 6.40186 8.34637 6.39979 8.18784V5.38703C6.39979 5.22786 6.46302 5.0752 6.57557 4.96265C6.68813 4.85009 6.84078 4.78686 6.99996 4.78686C7.15914 4.78686 7.31179 4.85009 7.42435 4.96265C7.5369 5.0752 7.60013 5.22786 7.60013 5.38703V8.18784C7.59806 8.34637 7.53416 8.49782 7.42205 8.60993C7.30995 8.72204 7.15849 8.78594 6.99996 8.78801Z"
                    fill="currentColor"
                />
                <path
                    d="M6.99996 11.1887C6.84143 11.1866 6.68997 11.1227 6.57787 11.0106C6.46576 10.8985 6.40186 10.7471 6.39979 10.5885V10.1884C6.39979 10.0292 6.46302 9.87658 6.57557 9.76403C6.68813 9.65147 6.84078 9.58824 6.99996 9.58824C7.15914 9.58824 7.31179 9.65147 7.42435 9.76403C7.5369 9.87658 7.60013 10.0292 7.60013 10.1884V10.5885C7.59806 10.7471 7.53416 10.8985 7.42205 11.0106C7.30995 11.1227 7.15849 11.1866 6.99996 11.1887Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-eye.mjs
var EyeIcon;
var init_primeng_icons_eye = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-eye.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    EyeIcon = class _EyeIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _EyeIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _EyeIcon,
        isStandalone: true,
        selector: "EyeIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.0535499 7.25213C0.208567 7.59162 2.40413 12.4 7 12.4C11.5959 12.4 13.7914 7.59162 13.9465 7.25213C13.9487 7.2471 13.9506 7.24304 13.952 7.24001C13.9837 7.16396 14 7.08239 14 7.00001C14 6.91762 13.9837 6.83605 13.952 6.76001C13.9506 6.75697 13.9487 6.75292 13.9465 6.74788C13.7914 6.4084 11.5959 1.60001 7 1.60001C2.40413 1.60001 0.208567 6.40839 0.0535499 6.74788C0.0512519 6.75292 0.0494023 6.75697 0.048 6.76001C0.0163137 6.83605 0 6.91762 0 7.00001C0 7.08239 0.0163137 7.16396 0.048 7.24001C0.0494023 7.24304 0.0512519 7.2471 0.0535499 7.25213ZM7 11.2C3.664 11.2 1.736 7.92001 1.264 7.00001C1.736 6.08001 3.664 2.80001 7 2.80001C10.336 2.80001 12.264 6.08001 12.736 7.00001C12.264 7.92001 10.336 11.2 7 11.2ZM5.55551 9.16182C5.98308 9.44751 6.48576 9.6 7 9.6C7.68891 9.59789 8.349 9.32328 8.83614 8.83614C9.32328 8.349 9.59789 7.68891 9.59999 7C9.59999 6.48576 9.44751 5.98308 9.16182 5.55551C8.87612 5.12794 8.47006 4.7947 7.99497 4.59791C7.51988 4.40112 6.99711 4.34963 6.49276 4.44995C5.98841 4.55027 5.52513 4.7979 5.16152 5.16152C4.7979 5.52513 4.55027 5.98841 4.44995 6.49276C4.34963 6.99711 4.40112 7.51988 4.59791 7.99497C4.7947 8.47006 5.12794 8.87612 5.55551 9.16182ZM6.2222 5.83594C6.45243 5.6821 6.7231 5.6 7 5.6C7.37065 5.6021 7.72553 5.75027 7.98762 6.01237C8.24972 6.27446 8.39789 6.62934 8.4 7C8.4 7.27689 8.31789 7.54756 8.16405 7.77779C8.01022 8.00802 7.79157 8.18746 7.53575 8.29343C7.27994 8.39939 6.99844 8.42711 6.72687 8.37309C6.4553 8.31908 6.20584 8.18574 6.01005 7.98994C5.81425 7.79415 5.68091 7.54469 5.6269 7.27312C5.57288 7.00155 5.6006 6.72006 5.70656 6.46424C5.81253 6.20842 5.99197 5.98977 6.2222 5.83594Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: EyeIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "EyeIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.0535499 7.25213C0.208567 7.59162 2.40413 12.4 7 12.4C11.5959 12.4 13.7914 7.59162 13.9465 7.25213C13.9487 7.2471 13.9506 7.24304 13.952 7.24001C13.9837 7.16396 14 7.08239 14 7.00001C14 6.91762 13.9837 6.83605 13.952 6.76001C13.9506 6.75697 13.9487 6.75292 13.9465 6.74788C13.7914 6.4084 11.5959 1.60001 7 1.60001C2.40413 1.60001 0.208567 6.40839 0.0535499 6.74788C0.0512519 6.75292 0.0494023 6.75697 0.048 6.76001C0.0163137 6.83605 0 6.91762 0 7.00001C0 7.08239 0.0163137 7.16396 0.048 7.24001C0.0494023 7.24304 0.0512519 7.2471 0.0535499 7.25213ZM7 11.2C3.664 11.2 1.736 7.92001 1.264 7.00001C1.736 6.08001 3.664 2.80001 7 2.80001C10.336 2.80001 12.264 6.08001 12.736 7.00001C12.264 7.92001 10.336 11.2 7 11.2ZM5.55551 9.16182C5.98308 9.44751 6.48576 9.6 7 9.6C7.68891 9.59789 8.349 9.32328 8.83614 8.83614C9.32328 8.349 9.59789 7.68891 9.59999 7C9.59999 6.48576 9.44751 5.98308 9.16182 5.55551C8.87612 5.12794 8.47006 4.7947 7.99497 4.59791C7.51988 4.40112 6.99711 4.34963 6.49276 4.44995C5.98841 4.55027 5.52513 4.7979 5.16152 5.16152C4.7979 5.52513 4.55027 5.98841 4.44995 6.49276C4.34963 6.99711 4.40112 7.51988 4.59791 7.99497C4.7947 8.47006 5.12794 8.87612 5.55551 9.16182ZM6.2222 5.83594C6.45243 5.6821 6.7231 5.6 7 5.6C7.37065 5.6021 7.72553 5.75027 7.98762 6.01237C8.24972 6.27446 8.39789 6.62934 8.4 7C8.4 7.27689 8.31789 7.54756 8.16405 7.77779C8.01022 8.00802 7.79157 8.18746 7.53575 8.29343C7.27994 8.39939 6.99844 8.42711 6.72687 8.37309C6.4553 8.31908 6.20584 8.18574 6.01005 7.98994C5.81425 7.79415 5.68091 7.54469 5.6269 7.27312C5.57288 7.00155 5.6006 6.72006 5.70656 6.46424C5.81253 6.20842 5.99197 5.98977 6.2222 5.83594Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-eyeslash.mjs
var EyeSlashIcon;
var init_primeng_icons_eyeslash = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-eyeslash.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    EyeSlashIcon = class _EyeSlashIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _EyeSlashIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _EyeSlashIcon,
        isStandalone: true,
        selector: "EyeSlashIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.9414 6.74792C13.9437 6.75295 13.9455 6.757 13.9469 6.76003C13.982 6.8394 14.0001 6.9252 14.0001 7.01195C14.0001 7.0987 13.982 7.1845 13.9469 7.26386C13.6004 8.00059 13.1711 8.69549 12.6674 9.33515C12.6115 9.4071 12.54 9.46538 12.4582 9.50556C12.3765 9.54574 12.2866 9.56678 12.1955 9.56707C12.0834 9.56671 11.9737 9.53496 11.8788 9.47541C11.7838 9.41586 11.7074 9.3309 11.6583 9.23015C11.6092 9.12941 11.5893 9.01691 11.6008 8.90543C11.6124 8.79394 11.6549 8.68793 11.7237 8.5994C12.1065 8.09726 12.4437 7.56199 12.7313 6.99995C12.2595 6.08027 10.3402 2.8014 6.99732 2.8014C6.63723 2.80218 6.27816 2.83969 5.92569 2.91336C5.77666 2.93304 5.62568 2.89606 5.50263 2.80972C5.37958 2.72337 5.29344 2.59398 5.26125 2.44714C5.22907 2.30031 5.2532 2.14674 5.32885 2.01685C5.40451 1.88696 5.52618 1.79021 5.66978 1.74576C6.10574 1.64961 6.55089 1.60134 6.99732 1.60181C11.5916 1.60181 13.7864 6.40856 13.9414 6.74792ZM2.20333 1.61685C2.35871 1.61411 2.5091 1.67179 2.6228 1.77774L12.2195 11.3744C12.3318 11.4869 12.3949 11.6393 12.3949 11.7983C12.3949 11.9572 12.3318 12.1097 12.2195 12.2221C12.107 12.3345 11.9546 12.3976 11.7956 12.3976C11.6367 12.3976 11.4842 12.3345 11.3718 12.2221L10.5081 11.3584C9.46549 12.0426 8.24432 12.4042 6.99729 12.3981C2.403 12.3981 0.208197 7.59135 0.0532336 7.25198C0.0509364 7.24694 0.0490875 7.2429 0.0476856 7.23986C0.0162332 7.16518 3.05176e-05 7.08497 3.05176e-05 7.00394C3.05176e-05 6.92291 0.0162332 6.8427 0.0476856 6.76802C0.631261 5.47831 1.46902 4.31959 2.51084 3.36119L1.77509 2.62545C1.66914 2.51175 1.61146 2.36136 1.61421 2.20597C1.61695 2.05059 1.6799 1.90233 1.78979 1.79244C1.89968 1.68254 2.04794 1.6196 2.20333 1.61685ZM7.45314 8.35147L5.68574 6.57609V6.5361C5.5872 6.78938 5.56498 7.06597 5.62183 7.33173C5.67868 7.59749 5.8121 7.84078 6.00563 8.03158C6.19567 8.21043 6.43052 8.33458 6.68533 8.39089C6.94014 8.44721 7.20543 8.43359 7.45314 8.35147ZM1.26327 6.99994C1.7351 7.91163 3.64645 11.1985 6.99729 11.1985C7.9267 11.2048 8.8408 10.9618 9.64438 10.4947L8.35682 9.20718C7.86027 9.51441 7.27449 9.64491 6.69448 9.57752C6.11446 9.51014 5.57421 9.24881 5.16131 8.83592C4.74842 8.42303 4.4871 7.88277 4.41971 7.30276C4.35232 6.72274 4.48282 6.13697 4.79005 5.64041L3.35855 4.2089C2.4954 5.00336 1.78523 5.94935 1.26327 6.99994Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: EyeSlashIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "EyeSlashIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.9414 6.74792C13.9437 6.75295 13.9455 6.757 13.9469 6.76003C13.982 6.8394 14.0001 6.9252 14.0001 7.01195C14.0001 7.0987 13.982 7.1845 13.9469 7.26386C13.6004 8.00059 13.1711 8.69549 12.6674 9.33515C12.6115 9.4071 12.54 9.46538 12.4582 9.50556C12.3765 9.54574 12.2866 9.56678 12.1955 9.56707C12.0834 9.56671 11.9737 9.53496 11.8788 9.47541C11.7838 9.41586 11.7074 9.3309 11.6583 9.23015C11.6092 9.12941 11.5893 9.01691 11.6008 8.90543C11.6124 8.79394 11.6549 8.68793 11.7237 8.5994C12.1065 8.09726 12.4437 7.56199 12.7313 6.99995C12.2595 6.08027 10.3402 2.8014 6.99732 2.8014C6.63723 2.80218 6.27816 2.83969 5.92569 2.91336C5.77666 2.93304 5.62568 2.89606 5.50263 2.80972C5.37958 2.72337 5.29344 2.59398 5.26125 2.44714C5.22907 2.30031 5.2532 2.14674 5.32885 2.01685C5.40451 1.88696 5.52618 1.79021 5.66978 1.74576C6.10574 1.64961 6.55089 1.60134 6.99732 1.60181C11.5916 1.60181 13.7864 6.40856 13.9414 6.74792ZM2.20333 1.61685C2.35871 1.61411 2.5091 1.67179 2.6228 1.77774L12.2195 11.3744C12.3318 11.4869 12.3949 11.6393 12.3949 11.7983C12.3949 11.9572 12.3318 12.1097 12.2195 12.2221C12.107 12.3345 11.9546 12.3976 11.7956 12.3976C11.6367 12.3976 11.4842 12.3345 11.3718 12.2221L10.5081 11.3584C9.46549 12.0426 8.24432 12.4042 6.99729 12.3981C2.403 12.3981 0.208197 7.59135 0.0532336 7.25198C0.0509364 7.24694 0.0490875 7.2429 0.0476856 7.23986C0.0162332 7.16518 3.05176e-05 7.08497 3.05176e-05 7.00394C3.05176e-05 6.92291 0.0162332 6.8427 0.0476856 6.76802C0.631261 5.47831 1.46902 4.31959 2.51084 3.36119L1.77509 2.62545C1.66914 2.51175 1.61146 2.36136 1.61421 2.20597C1.61695 2.05059 1.6799 1.90233 1.78979 1.79244C1.89968 1.68254 2.04794 1.6196 2.20333 1.61685ZM7.45314 8.35147L5.68574 6.57609V6.5361C5.5872 6.78938 5.56498 7.06597 5.62183 7.33173C5.67868 7.59749 5.8121 7.84078 6.00563 8.03158C6.19567 8.21043 6.43052 8.33458 6.68533 8.39089C6.94014 8.44721 7.20543 8.43359 7.45314 8.35147ZM1.26327 6.99994C1.7351 7.91163 3.64645 11.1985 6.99729 11.1985C7.9267 11.2048 8.8408 10.9618 9.64438 10.4947L8.35682 9.20718C7.86027 9.51441 7.27449 9.64491 6.69448 9.57752C6.11446 9.51014 5.57421 9.24881 5.16131 8.83592C4.74842 8.42303 4.4871 7.88277 4.41971 7.30276C4.35232 6.72274 4.48282 6.13697 4.79005 5.64041L3.35855 4.2089C2.4954 5.00336 1.78523 5.94935 1.26327 6.99994Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-filter.mjs
var FilterIcon;
var init_primeng_icons_filter = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-filter.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    FilterIcon = class _FilterIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _FilterIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _FilterIcon,
        isStandalone: true,
        selector: "FilterIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M8.64708 14H5.35296C5.18981 13.9979 5.03395 13.9321 4.91858 13.8167C4.8032 13.7014 4.73745 13.5455 4.73531 13.3824V7L0.329431 0.98C0.259794 0.889466 0.217389 0.780968 0.20718 0.667208C0.19697 0.553448 0.219379 0.439133 0.271783 0.337647C0.324282 0.236453 0.403423 0.151519 0.500663 0.0920138C0.597903 0.0325088 0.709548 0.000692754 0.823548 0H13.1765C13.2905 0.000692754 13.4021 0.0325088 13.4994 0.0920138C13.5966 0.151519 13.6758 0.236453 13.7283 0.337647C13.7807 0.439133 13.8031 0.553448 13.7929 0.667208C13.7826 0.780968 13.7402 0.889466 13.6706 0.98L9.26472 7V13.3824C9.26259 13.5455 9.19683 13.7014 9.08146 13.8167C8.96609 13.9321 8.81022 13.9979 8.64708 14ZM5.97061 12.7647H8.02943V6.79412C8.02878 6.66289 8.07229 6.53527 8.15296 6.43177L11.9412 1.23529H2.05884L5.86355 6.43177C5.94422 6.53527 5.98773 6.66289 5.98708 6.79412L5.97061 12.7647Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: FilterIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "FilterIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M8.64708 14H5.35296C5.18981 13.9979 5.03395 13.9321 4.91858 13.8167C4.8032 13.7014 4.73745 13.5455 4.73531 13.3824V7L0.329431 0.98C0.259794 0.889466 0.217389 0.780968 0.20718 0.667208C0.19697 0.553448 0.219379 0.439133 0.271783 0.337647C0.324282 0.236453 0.403423 0.151519 0.500663 0.0920138C0.597903 0.0325088 0.709548 0.000692754 0.823548 0H13.1765C13.2905 0.000692754 13.4021 0.0325088 13.4994 0.0920138C13.5966 0.151519 13.6758 0.236453 13.7283 0.337647C13.7807 0.439133 13.8031 0.553448 13.7929 0.667208C13.7826 0.780968 13.7402 0.889466 13.6706 0.98L9.26472 7V13.3824C9.26259 13.5455 9.19683 13.7014 9.08146 13.8167C8.96609 13.9321 8.81022 13.9979 8.64708 14ZM5.97061 12.7647H8.02943V6.79412C8.02878 6.66289 8.07229 6.53527 8.15296 6.43177L11.9412 1.23529H2.05884L5.86355 6.43177C5.94422 6.53527 5.98773 6.66289 5.98708 6.79412L5.97061 12.7647Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-filterslash.mjs
var FilterSlashIcon;
var init_primeng_icons_filterslash = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-filterslash.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    FilterSlashIcon = class _FilterSlashIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _FilterSlashIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _FilterSlashIcon,
        isStandalone: true,
        selector: "FilterSlashIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.4994 0.0920138C13.5967 0.151519 13.6758 0.236453 13.7283 0.337647C13.7807 0.439133 13.8031 0.553448 13.7929 0.667208C13.7827 0.780968 13.7403 0.889466 13.6707 0.98L11.406 4.06823C11.3099 4.19928 11.1656 4.28679 11.005 4.3115C10.8444 4.33621 10.6805 4.2961 10.5495 4.2C10.4184 4.1039 10.3309 3.95967 10.3062 3.79905C10.2815 3.63843 10.3216 3.47458 10.4177 3.34353L11.9412 1.23529H7.41184C7.24803 1.23529 7.09093 1.17022 6.97509 1.05439C6.85926 0.938558 6.79419 0.781457 6.79419 0.617647C6.79419 0.453837 6.85926 0.296736 6.97509 0.180905C7.09093 0.0650733 7.24803 0 7.41184 0H13.1765C13.2905 0.000692754 13.4022 0.0325088 13.4994 0.0920138ZM4.20008 0.181168H4.24126L13.2013 9.03411C13.3169 9.14992 13.3819 9.3069 13.3819 9.47058C13.3819 9.63426 13.3169 9.79124 13.2013 9.90705C13.1445 9.96517 13.0766 10.0112 13.0016 10.0423C12.9266 10.0735 12.846 10.0891 12.7648 10.0882C12.6836 10.0886 12.6032 10.0728 12.5283 10.0417C12.4533 10.0106 12.3853 9.96479 12.3283 9.90705L9.3142 6.92587L9.26479 6.99999V13.3823C9.26265 13.5455 9.19689 13.7014 9.08152 13.8167C8.96615 13.9321 8.81029 13.9979 8.64714 14H5.35302C5.18987 13.9979 5.03401 13.9321 4.91864 13.8167C4.80327 13.7014 4.73751 13.5455 4.73537 13.3823V6.99999L0.329492 1.02117C0.259855 0.930634 0.21745 0.822137 0.207241 0.708376C0.197031 0.594616 0.21944 0.480301 0.271844 0.378815C0.324343 0.277621 0.403484 0.192687 0.500724 0.133182C0.597964 0.073677 0.709609 0.041861 0.823609 0.0411682H3.86243C3.92448 0.0461551 3.9855 0.060022 4.04361 0.0823446C4.10037 0.10735 4.15311 0.140655 4.20008 0.181168ZM8.02949 6.79411C8.02884 6.66289 8.07235 6.53526 8.15302 6.43176L8.42478 6.05293L3.55773 1.23529H2.0589L5.84714 6.43176C5.92781 6.53526 5.97132 6.66289 5.97067 6.79411V12.7647H8.02949V6.79411Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: FilterSlashIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "FilterSlashIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.4994 0.0920138C13.5967 0.151519 13.6758 0.236453 13.7283 0.337647C13.7807 0.439133 13.8031 0.553448 13.7929 0.667208C13.7827 0.780968 13.7403 0.889466 13.6707 0.98L11.406 4.06823C11.3099 4.19928 11.1656 4.28679 11.005 4.3115C10.8444 4.33621 10.6805 4.2961 10.5495 4.2C10.4184 4.1039 10.3309 3.95967 10.3062 3.79905C10.2815 3.63843 10.3216 3.47458 10.4177 3.34353L11.9412 1.23529H7.41184C7.24803 1.23529 7.09093 1.17022 6.97509 1.05439C6.85926 0.938558 6.79419 0.781457 6.79419 0.617647C6.79419 0.453837 6.85926 0.296736 6.97509 0.180905C7.09093 0.0650733 7.24803 0 7.41184 0H13.1765C13.2905 0.000692754 13.4022 0.0325088 13.4994 0.0920138ZM4.20008 0.181168H4.24126L13.2013 9.03411C13.3169 9.14992 13.3819 9.3069 13.3819 9.47058C13.3819 9.63426 13.3169 9.79124 13.2013 9.90705C13.1445 9.96517 13.0766 10.0112 13.0016 10.0423C12.9266 10.0735 12.846 10.0891 12.7648 10.0882C12.6836 10.0886 12.6032 10.0728 12.5283 10.0417C12.4533 10.0106 12.3853 9.96479 12.3283 9.90705L9.3142 6.92587L9.26479 6.99999V13.3823C9.26265 13.5455 9.19689 13.7014 9.08152 13.8167C8.96615 13.9321 8.81029 13.9979 8.64714 14H5.35302C5.18987 13.9979 5.03401 13.9321 4.91864 13.8167C4.80327 13.7014 4.73751 13.5455 4.73537 13.3823V6.99999L0.329492 1.02117C0.259855 0.930634 0.21745 0.822137 0.207241 0.708376C0.197031 0.594616 0.21944 0.480301 0.271844 0.378815C0.324343 0.277621 0.403484 0.192687 0.500724 0.133182C0.597964 0.073677 0.709609 0.041861 0.823609 0.0411682H3.86243C3.92448 0.0461551 3.9855 0.060022 4.04361 0.0823446C4.10037 0.10735 4.15311 0.140655 4.20008 0.181168ZM8.02949 6.79411C8.02884 6.66289 8.07235 6.53526 8.15302 6.43176L8.42478 6.05293L3.55773 1.23529H2.0589L5.84714 6.43176C5.92781 6.53526 5.97132 6.66289 5.97067 6.79411V12.7647H8.02949V6.79411Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-home.mjs
var HomeIcon;
var init_primeng_icons_home = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-home.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    HomeIcon = class _HomeIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _HomeIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _HomeIcon,
        isStandalone: true,
        selector: "HomeIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.4175 6.79971C13.2874 6.80029 13.1608 6.75807 13.057 6.67955L12.4162 6.19913V12.6073C12.4141 12.7659 12.3502 12.9176 12.2379 13.0298C12.1257 13.142 11.9741 13.206 11.8154 13.208H8.61206C8.61179 13.208 8.61151 13.208 8.61123 13.2081C8.61095 13.208 8.61068 13.208 8.6104 13.208H5.41076C5.40952 13.208 5.40829 13.2081 5.40705 13.2081C5.40581 13.2081 5.40458 13.208 5.40334 13.208H2.20287C2.04418 13.206 1.89257 13.142 1.78035 13.0298C1.66813 12.9176 1.60416 12.7659 1.60209 12.6073V6.19914L0.961256 6.67955C0.833786 6.77515 0.673559 6.8162 0.515823 6.79367C0.358086 6.77114 0.215762 6.68686 0.120159 6.55939C0.0245566 6.43192 -0.0164931 6.2717 0.00604063 6.11396C0.0285744 5.95622 0.112846 5.8139 0.240316 5.7183L1.83796 4.52007L1.84689 4.51337L6.64868 0.912027C6.75267 0.834032 6.87915 0.79187 7.00915 0.79187C7.13914 0.79187 7.26562 0.834032 7.36962 0.912027L12.1719 4.51372L12.1799 4.51971L13.778 5.7183C13.8943 5.81278 13.9711 5.94732 13.9934 6.09553C14.0156 6.24373 13.9816 6.39489 13.8981 6.51934C13.8471 6.60184 13.7766 6.67054 13.6928 6.71942C13.609 6.76831 13.5144 6.79587 13.4175 6.79971ZM6.00783 12.0065H8.01045V7.60074H6.00783V12.0065ZM9.21201 12.0065V6.99995C9.20994 6.84126 9.14598 6.68965 9.03375 6.57743C8.92153 6.46521 8.76992 6.40124 8.61123 6.39917H5.40705C5.24836 6.40124 5.09675 6.46521 4.98453 6.57743C4.8723 6.68965 4.80834 6.84126 4.80627 6.99995V12.0065H2.80366V5.29836L7.00915 2.14564L11.2146 5.29836V12.0065H9.21201Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: HomeIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "HomeIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.4175 6.79971C13.2874 6.80029 13.1608 6.75807 13.057 6.67955L12.4162 6.19913V12.6073C12.4141 12.7659 12.3502 12.9176 12.2379 13.0298C12.1257 13.142 11.9741 13.206 11.8154 13.208H8.61206C8.61179 13.208 8.61151 13.208 8.61123 13.2081C8.61095 13.208 8.61068 13.208 8.6104 13.208H5.41076C5.40952 13.208 5.40829 13.2081 5.40705 13.2081C5.40581 13.2081 5.40458 13.208 5.40334 13.208H2.20287C2.04418 13.206 1.89257 13.142 1.78035 13.0298C1.66813 12.9176 1.60416 12.7659 1.60209 12.6073V6.19914L0.961256 6.67955C0.833786 6.77515 0.673559 6.8162 0.515823 6.79367C0.358086 6.77114 0.215762 6.68686 0.120159 6.55939C0.0245566 6.43192 -0.0164931 6.2717 0.00604063 6.11396C0.0285744 5.95622 0.112846 5.8139 0.240316 5.7183L1.83796 4.52007L1.84689 4.51337L6.64868 0.912027C6.75267 0.834032 6.87915 0.79187 7.00915 0.79187C7.13914 0.79187 7.26562 0.834032 7.36962 0.912027L12.1719 4.51372L12.1799 4.51971L13.778 5.7183C13.8943 5.81278 13.9711 5.94732 13.9934 6.09553C14.0156 6.24373 13.9816 6.39489 13.8981 6.51934C13.8471 6.60184 13.7766 6.67054 13.6928 6.71942C13.609 6.76831 13.5144 6.79587 13.4175 6.79971ZM6.00783 12.0065H8.01045V7.60074H6.00783V12.0065ZM9.21201 12.0065V6.99995C9.20994 6.84126 9.14598 6.68965 9.03375 6.57743C8.92153 6.46521 8.76992 6.40124 8.61123 6.39917H5.40705C5.24836 6.40124 5.09675 6.46521 4.98453 6.57743C4.8723 6.68965 4.80834 6.84126 4.80627 6.99995V12.0065H2.80366V5.29836L7.00915 2.14564L11.2146 5.29836V12.0065H9.21201Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-infocircle.mjs
var InfoCircleIcon;
var init_primeng_icons_infocircle = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-infocircle.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    InfoCircleIcon = class _InfoCircleIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _InfoCircleIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _InfoCircleIcon,
        isStandalone: true,
        selector: "InfoCircleIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.11101 12.8203C4.26215 13.5895 5.61553 14 7 14C8.85652 14 10.637 13.2625 11.9497 11.9497C13.2625 10.637 14 8.85652 14 7C14 5.61553 13.5895 4.26215 12.8203 3.11101C12.0511 1.95987 10.9579 1.06266 9.67879 0.532846C8.3997 0.00303296 6.99224 -0.13559 5.63437 0.134506C4.2765 0.404603 3.02922 1.07129 2.05026 2.05026C1.07129 3.02922 0.404603 4.2765 0.134506 5.63437C-0.13559 6.99224 0.00303296 8.3997 0.532846 9.67879C1.06266 10.9579 1.95987 12.0511 3.11101 12.8203ZM3.75918 2.14976C4.71846 1.50879 5.84628 1.16667 7 1.16667C8.5471 1.16667 10.0308 1.78125 11.1248 2.87521C12.2188 3.96918 12.8333 5.45291 12.8333 7C12.8333 8.15373 12.4912 9.28154 11.8502 10.2408C11.2093 11.2001 10.2982 11.9478 9.23232 12.3893C8.16642 12.8308 6.99353 12.9463 5.86198 12.7212C4.73042 12.4962 3.69102 11.9406 2.87521 11.1248C2.05941 10.309 1.50384 9.26958 1.27876 8.13803C1.05367 7.00647 1.16919 5.83358 1.61071 4.76768C2.05222 3.70178 2.79989 2.79074 3.75918 2.14976ZM7.00002 4.8611C6.84594 4.85908 6.69873 4.79698 6.58977 4.68801C6.48081 4.57905 6.4187 4.43185 6.41669 4.27776V3.88888C6.41669 3.73417 6.47815 3.58579 6.58754 3.4764C6.69694 3.367 6.84531 3.30554 7.00002 3.30554C7.15473 3.30554 7.3031 3.367 7.4125 3.4764C7.52189 3.58579 7.58335 3.73417 7.58335 3.88888V4.27776C7.58134 4.43185 7.51923 4.57905 7.41027 4.68801C7.30131 4.79698 7.1541 4.85908 7.00002 4.8611ZM7.00002 10.6945C6.84594 10.6925 6.69873 10.6304 6.58977 10.5214C6.48081 10.4124 6.4187 10.2652 6.41669 10.1111V6.22225C6.41669 6.06754 6.47815 5.91917 6.58754 5.80977C6.69694 5.70037 6.84531 5.63892 7.00002 5.63892C7.15473 5.63892 7.3031 5.70037 7.4125 5.80977C7.52189 5.91917 7.58335 6.06754 7.58335 6.22225V10.1111C7.58134 10.2652 7.51923 10.4124 7.41027 10.5214C7.30131 10.6304 7.1541 10.6925 7.00002 10.6945Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: InfoCircleIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "InfoCircleIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.11101 12.8203C4.26215 13.5895 5.61553 14 7 14C8.85652 14 10.637 13.2625 11.9497 11.9497C13.2625 10.637 14 8.85652 14 7C14 5.61553 13.5895 4.26215 12.8203 3.11101C12.0511 1.95987 10.9579 1.06266 9.67879 0.532846C8.3997 0.00303296 6.99224 -0.13559 5.63437 0.134506C4.2765 0.404603 3.02922 1.07129 2.05026 2.05026C1.07129 3.02922 0.404603 4.2765 0.134506 5.63437C-0.13559 6.99224 0.00303296 8.3997 0.532846 9.67879C1.06266 10.9579 1.95987 12.0511 3.11101 12.8203ZM3.75918 2.14976C4.71846 1.50879 5.84628 1.16667 7 1.16667C8.5471 1.16667 10.0308 1.78125 11.1248 2.87521C12.2188 3.96918 12.8333 5.45291 12.8333 7C12.8333 8.15373 12.4912 9.28154 11.8502 10.2408C11.2093 11.2001 10.2982 11.9478 9.23232 12.3893C8.16642 12.8308 6.99353 12.9463 5.86198 12.7212C4.73042 12.4962 3.69102 11.9406 2.87521 11.1248C2.05941 10.309 1.50384 9.26958 1.27876 8.13803C1.05367 7.00647 1.16919 5.83358 1.61071 4.76768C2.05222 3.70178 2.79989 2.79074 3.75918 2.14976ZM7.00002 4.8611C6.84594 4.85908 6.69873 4.79698 6.58977 4.68801C6.48081 4.57905 6.4187 4.43185 6.41669 4.27776V3.88888C6.41669 3.73417 6.47815 3.58579 6.58754 3.4764C6.69694 3.367 6.84531 3.30554 7.00002 3.30554C7.15473 3.30554 7.3031 3.367 7.4125 3.4764C7.52189 3.58579 7.58335 3.73417 7.58335 3.88888V4.27776C7.58134 4.43185 7.51923 4.57905 7.41027 4.68801C7.30131 4.79698 7.1541 4.85908 7.00002 4.8611ZM7.00002 10.6945C6.84594 10.6925 6.69873 10.6304 6.58977 10.5214C6.48081 10.4124 6.4187 10.2652 6.41669 10.1111V6.22225C6.41669 6.06754 6.47815 5.91917 6.58754 5.80977C6.69694 5.70037 6.84531 5.63892 7.00002 5.63892C7.15473 5.63892 7.3031 5.70037 7.4125 5.80977C7.52189 5.91917 7.58335 6.06754 7.58335 6.22225V10.1111C7.58134 10.2652 7.51923 10.4124 7.41027 10.5214C7.30131 10.6304 7.1541 10.6925 7.00002 10.6945Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-minus.mjs
var MinusIcon;
var init_primeng_icons_minus = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-minus.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    MinusIcon = class _MinusIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _MinusIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _MinusIcon,
        isStandalone: true,
        selector: "MinusIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: MinusIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "MinusIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-pencil.mjs
var PencilIcon;
var init_primeng_icons_pencil = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-pencil.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    PencilIcon = class _PencilIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _PencilIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _PencilIcon,
        isStandalone: true,
        selector: "PencilIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M0.609628 13.959C0.530658 13.9599 0.452305 13.9451 0.379077 13.9156C0.305849 13.8861 0.239191 13.8424 0.18294 13.787C0.118447 13.7234 0.0688234 13.6464 0.0376166 13.5614C0.00640987 13.4765 -0.00560954 13.3857 0.00241768 13.2956L0.25679 10.1501C0.267698 10.0041 0.331934 9.86709 0.437312 9.76516L9.51265 0.705715C10.0183 0.233014 10.6911 -0.0203041 11.3835 0.00127367C12.0714 0.00660201 12.7315 0.27311 13.2298 0.746671C13.7076 1.23651 13.9824 1.88848 13.9992 2.57201C14.0159 3.25554 13.7733 3.92015 13.32 4.4327L4.23648 13.5331C4.13482 13.6342 4.0017 13.6978 3.85903 13.7133L0.667067 14L0.609628 13.959ZM1.43018 10.4696L1.25787 12.714L3.50619 12.5092L12.4502 3.56444C12.6246 3.35841 12.7361 3.10674 12.7714 2.83933C12.8067 2.57193 12.7644 2.30002 12.6495 2.05591C12.5346 1.8118 12.3519 1.60575 12.1231 1.46224C11.8943 1.31873 11.6291 1.2438 11.3589 1.24633C11.1813 1.23508 11.0033 1.25975 10.8355 1.31887C10.6677 1.37798 10.5136 1.47033 10.3824 1.59036L1.43018 10.4696Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: PencilIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "PencilIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M0.609628 13.959C0.530658 13.9599 0.452305 13.9451 0.379077 13.9156C0.305849 13.8861 0.239191 13.8424 0.18294 13.787C0.118447 13.7234 0.0688234 13.6464 0.0376166 13.5614C0.00640987 13.4765 -0.00560954 13.3857 0.00241768 13.2956L0.25679 10.1501C0.267698 10.0041 0.331934 9.86709 0.437312 9.76516L9.51265 0.705715C10.0183 0.233014 10.6911 -0.0203041 11.3835 0.00127367C12.0714 0.00660201 12.7315 0.27311 13.2298 0.746671C13.7076 1.23651 13.9824 1.88848 13.9992 2.57201C14.0159 3.25554 13.7733 3.92015 13.32 4.4327L4.23648 13.5331C4.13482 13.6342 4.0017 13.6978 3.85903 13.7133L0.667067 14L0.609628 13.959ZM1.43018 10.4696L1.25787 12.714L3.50619 12.5092L12.4502 3.56444C12.6246 3.35841 12.7361 3.10674 12.7714 2.83933C12.8067 2.57193 12.7644 2.30002 12.6495 2.05591C12.5346 1.8118 12.3519 1.60575 12.1231 1.46224C11.8943 1.31873 11.6291 1.2438 11.3589 1.24633C11.1813 1.23508 11.0033 1.25975 10.8355 1.31887C10.6677 1.37798 10.5136 1.47033 10.3824 1.59036L1.43018 10.4696Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-plus.mjs
var PlusIcon;
var init_primeng_icons_plus = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-plus.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    PlusIcon = class _PlusIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _PlusIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _PlusIcon,
        isStandalone: true,
        selector: "PlusIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: PlusIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "PlusIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-refresh.mjs
var RefreshIcon;
var init_primeng_icons_refresh = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-refresh.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    RefreshIcon = class _RefreshIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _RefreshIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _RefreshIcon,
        isStandalone: true,
        selector: "RefreshIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.77051 5.96336C6.84324 5.99355 6.92127 6.00891 7.00002 6.00854C7.07877 6.00891 7.1568 5.99355 7.22953 5.96336C7.30226 5.93317 7.36823 5.88876 7.42357 5.83273L9.82101 3.43529C9.93325 3.32291 9.99629 3.17058 9.99629 3.01175C9.99629 2.85292 9.93325 2.70058 9.82101 2.5882L7.42357 0.190763C7.3687 0.131876 7.30253 0.0846451 7.22901 0.0518865C7.15549 0.019128 7.07612 0.00151319 6.99564 9.32772e-05C6.91517 -0.00132663 6.83523 0.0134773 6.7606 0.0436218C6.68597 0.0737664 6.61817 0.118634 6.56126 0.175548C6.50435 0.232462 6.45948 0.300257 6.42933 0.374888C6.39919 0.449519 6.38439 0.529456 6.38581 0.609933C6.38722 0.690409 6.40484 0.769775 6.4376 0.843296C6.47036 0.916817 6.51759 0.982986 6.57647 1.03786L7.95103 2.41241H6.99998C5.46337 2.41241 3.98969 3.02283 2.90314 4.10938C1.81659 5.19593 1.20618 6.66961 1.20618 8.20622C1.20618 9.74283 1.81659 11.2165 2.90314 12.3031C3.98969 13.3896 5.46337 14 6.99998 14C8.53595 13.9979 10.0084 13.3868 11.0945 12.3007C12.1806 11.2146 12.7917 9.74218 12.7938 8.20622C12.7938 8.04726 12.7306 7.89481 12.6182 7.78241C12.5058 7.67001 12.3534 7.60686 12.1944 7.60686C12.0355 7.60686 11.883 7.67001 11.7706 7.78241C11.6582 7.89481 11.5951 8.04726 11.5951 8.20622C11.5951 9.11504 11.3256 10.0035 10.8207 10.7591C10.3157 11.5148 9.59809 12.1037 8.75845 12.4515C7.9188 12.7993 6.99489 12.8903 6.10353 12.713C5.21217 12.5357 4.3934 12.0981 3.75077 11.4554C3.10813 10.8128 2.67049 9.99404 2.49319 9.10268C2.31589 8.21132 2.40688 7.2874 2.75468 6.44776C3.10247 5.60811 3.69143 4.89046 4.44709 4.38554C5.20275 3.88063 6.09116 3.61113 6.99998 3.61113H7.95098L6.57647 4.98564C6.46423 5.09802 6.40119 5.25035 6.40119 5.40918C6.40119 5.56801 6.46423 5.72035 6.57647 5.83273C6.63181 5.88876 6.69778 5.93317 6.77051 5.96336Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: RefreshIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "RefreshIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.77051 5.96336C6.84324 5.99355 6.92127 6.00891 7.00002 6.00854C7.07877 6.00891 7.1568 5.99355 7.22953 5.96336C7.30226 5.93317 7.36823 5.88876 7.42357 5.83273L9.82101 3.43529C9.93325 3.32291 9.99629 3.17058 9.99629 3.01175C9.99629 2.85292 9.93325 2.70058 9.82101 2.5882L7.42357 0.190763C7.3687 0.131876 7.30253 0.0846451 7.22901 0.0518865C7.15549 0.019128 7.07612 0.00151319 6.99564 9.32772e-05C6.91517 -0.00132663 6.83523 0.0134773 6.7606 0.0436218C6.68597 0.0737664 6.61817 0.118634 6.56126 0.175548C6.50435 0.232462 6.45948 0.300257 6.42933 0.374888C6.39919 0.449519 6.38439 0.529456 6.38581 0.609933C6.38722 0.690409 6.40484 0.769775 6.4376 0.843296C6.47036 0.916817 6.51759 0.982986 6.57647 1.03786L7.95103 2.41241H6.99998C5.46337 2.41241 3.98969 3.02283 2.90314 4.10938C1.81659 5.19593 1.20618 6.66961 1.20618 8.20622C1.20618 9.74283 1.81659 11.2165 2.90314 12.3031C3.98969 13.3896 5.46337 14 6.99998 14C8.53595 13.9979 10.0084 13.3868 11.0945 12.3007C12.1806 11.2146 12.7917 9.74218 12.7938 8.20622C12.7938 8.04726 12.7306 7.89481 12.6182 7.78241C12.5058 7.67001 12.3534 7.60686 12.1944 7.60686C12.0355 7.60686 11.883 7.67001 11.7706 7.78241C11.6582 7.89481 11.5951 8.04726 11.5951 8.20622C11.5951 9.11504 11.3256 10.0035 10.8207 10.7591C10.3157 11.5148 9.59809 12.1037 8.75845 12.4515C7.9188 12.7993 6.99489 12.8903 6.10353 12.713C5.21217 12.5357 4.3934 12.0981 3.75077 11.4554C3.10813 10.8128 2.67049 9.99404 2.49319 9.10268C2.31589 8.21132 2.40688 7.2874 2.75468 6.44776C3.10247 5.60811 3.69143 4.89046 4.44709 4.38554C5.20275 3.88063 6.09116 3.61113 6.99998 3.61113H7.95098L6.57647 4.98564C6.46423 5.09802 6.40119 5.25035 6.40119 5.40918C6.40119 5.56801 6.46423 5.72035 6.57647 5.83273C6.63181 5.88876 6.69778 5.93317 6.77051 5.96336Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-search.mjs
var SearchIcon;
var init_primeng_icons_search = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-search.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SearchIcon = class _SearchIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SearchIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SearchIcon,
        isStandalone: true,
        selector: "SearchIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SearchIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SearchIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-searchminus.mjs
var SearchMinusIcon;
var init_primeng_icons_searchminus = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-searchminus.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SearchMinusIcon = class _SearchMinusIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SearchMinusIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SearchMinusIcon,
        isStandalone: true,
        selector: "SearchMinusIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.0208 12.0411C4.83005 12.0411 3.66604 11.688 2.67596 11.0265C1.68589 10.3649 0.914216 9.42464 0.458534 8.32452C0.00285271 7.22441 -0.116374 6.01388 0.11593 4.84601C0.348235 3.67813 0.921637 2.60537 1.76363 1.76338C2.60562 0.921393 3.67838 0.34799 4.84625 0.115686C6.01412 -0.116618 7.22466 0.00260857 8.32477 0.45829C9.42488 0.913972 10.3652 1.68564 11.0267 2.67572C11.6883 3.66579 12.0414 4.8298 12.0414 6.02056C12.0395 7.41563 11.5542 8.76029 10.6783 9.8305L13.8244 12.9765C13.9367 13.089 13.9997 13.2414 13.9997 13.4003C13.9997 13.5592 13.9367 13.7116 13.8244 13.8241C13.769 13.8801 13.703 13.9245 13.6302 13.9548C13.5575 13.985 13.4794 14.0003 13.4006 14C13.3218 14.0003 13.2437 13.985 13.171 13.9548C13.0982 13.9245 13.0322 13.8801 12.9768 13.8241L9.83082 10.678C8.76059 11.5539 7.4159 12.0393 6.0208 12.0411ZM6.0208 1.20731C5.07199 1.20731 4.14449 1.48867 3.35559 2.0158C2.56669 2.54292 1.95181 3.29215 1.58872 4.16874C1.22562 5.04532 1.13062 6.00989 1.31572 6.94046C1.50083 7.87104 1.95772 8.72583 2.62863 9.39674C3.29954 10.0676 4.15433 10.5245 5.0849 10.7096C6.01548 10.8947 6.98005 10.7997 7.85663 10.4367C8.73322 10.0736 9.48244 9.45868 10.0096 8.66978C10.5367 7.88088 10.8181 6.95337 10.8181 6.00457C10.8181 4.73226 10.3126 3.51206 9.41297 2.6124C8.51331 1.71274 7.29311 1.20731 6.0208 1.20731ZM4.00591 6.60422H8.00362C8.16266 6.60422 8.31518 6.54104 8.42764 6.42859C8.5401 6.31613 8.60328 6.1636 8.60328 6.00456C8.60328 5.84553 8.5401 5.693 8.42764 5.58054C8.31518 5.46809 8.16266 5.40491 8.00362 5.40491H4.00591C3.84687 5.40491 3.69434 5.46809 3.58189 5.58054C3.46943 5.693 3.40625 5.84553 3.40625 6.00456C3.40625 6.1636 3.46943 6.31613 3.58189 6.42859C3.69434 6.54104 3.84687 6.60422 4.00591 6.60422Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SearchMinusIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SearchMinusIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.0208 12.0411C4.83005 12.0411 3.66604 11.688 2.67596 11.0265C1.68589 10.3649 0.914216 9.42464 0.458534 8.32452C0.00285271 7.22441 -0.116374 6.01388 0.11593 4.84601C0.348235 3.67813 0.921637 2.60537 1.76363 1.76338C2.60562 0.921393 3.67838 0.34799 4.84625 0.115686C6.01412 -0.116618 7.22466 0.00260857 8.32477 0.45829C9.42488 0.913972 10.3652 1.68564 11.0267 2.67572C11.6883 3.66579 12.0414 4.8298 12.0414 6.02056C12.0395 7.41563 11.5542 8.76029 10.6783 9.8305L13.8244 12.9765C13.9367 13.089 13.9997 13.2414 13.9997 13.4003C13.9997 13.5592 13.9367 13.7116 13.8244 13.8241C13.769 13.8801 13.703 13.9245 13.6302 13.9548C13.5575 13.985 13.4794 14.0003 13.4006 14C13.3218 14.0003 13.2437 13.985 13.171 13.9548C13.0982 13.9245 13.0322 13.8801 12.9768 13.8241L9.83082 10.678C8.76059 11.5539 7.4159 12.0393 6.0208 12.0411ZM6.0208 1.20731C5.07199 1.20731 4.14449 1.48867 3.35559 2.0158C2.56669 2.54292 1.95181 3.29215 1.58872 4.16874C1.22562 5.04532 1.13062 6.00989 1.31572 6.94046C1.50083 7.87104 1.95772 8.72583 2.62863 9.39674C3.29954 10.0676 4.15433 10.5245 5.0849 10.7096C6.01548 10.8947 6.98005 10.7997 7.85663 10.4367C8.73322 10.0736 9.48244 9.45868 10.0096 8.66978C10.5367 7.88088 10.8181 6.95337 10.8181 6.00457C10.8181 4.73226 10.3126 3.51206 9.41297 2.6124C8.51331 1.71274 7.29311 1.20731 6.0208 1.20731ZM4.00591 6.60422H8.00362C8.16266 6.60422 8.31518 6.54104 8.42764 6.42859C8.5401 6.31613 8.60328 6.1636 8.60328 6.00456C8.60328 5.84553 8.5401 5.693 8.42764 5.58054C8.31518 5.46809 8.16266 5.40491 8.00362 5.40491H4.00591C3.84687 5.40491 3.69434 5.46809 3.58189 5.58054C3.46943 5.693 3.40625 5.84553 3.40625 6.00456C3.40625 6.1636 3.46943 6.31613 3.58189 6.42859C3.69434 6.54104 3.84687 6.60422 4.00591 6.60422Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-searchplus.mjs
var SearchPlusIcon;
var init_primeng_icons_searchplus = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-searchplus.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SearchPlusIcon = class _SearchPlusIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SearchPlusIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SearchPlusIcon,
        isStandalone: true,
        selector: "SearchPlusIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.67596 11.0265C3.66604 11.688 4.83005 12.0411 6.0208 12.0411C6.81143 12.0411 7.59432 11.8854 8.32477 11.5828C8.86999 11.357 9.37802 11.0526 9.83311 10.6803L12.9768 13.8241C13.0322 13.8801 13.0982 13.9245 13.171 13.9548C13.2437 13.985 13.3218 14.0003 13.4006 14C13.4794 14.0003 13.5575 13.985 13.6302 13.9548C13.703 13.9245 13.769 13.8801 13.8244 13.8241C13.9367 13.7116 13.9997 13.5592 13.9997 13.4003C13.9997 13.2414 13.9367 13.089 13.8244 12.9765L10.6806 9.8328C11.0529 9.37773 11.3572 8.86972 11.5831 8.32452C11.8856 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0267 2.67572C10.3652 1.68564 9.42488 0.913972 8.32477 0.45829C7.22466 0.00260857 6.01412 -0.116618 4.84625 0.115686C3.67838 0.34799 2.60562 0.921393 1.76363 1.76338C0.921637 2.60537 0.348235 3.67813 0.11593 4.84601C-0.116374 6.01388 0.00285271 7.22441 0.458534 8.32452C0.914216 9.42464 1.68589 10.3649 2.67596 11.0265ZM3.35559 2.0158C4.14449 1.48867 5.07199 1.20731 6.0208 1.20731C7.29311 1.20731 8.51331 1.71274 9.41297 2.6124C10.3126 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5367 7.88088 10.0096 8.66978C9.48244 9.45868 8.73322 10.0736 7.85663 10.4367C6.98005 10.7997 6.01548 10.8947 5.0849 10.7096C4.15433 10.5245 3.29954 10.0676 2.62863 9.39674C1.95772 8.72583 1.50083 7.87104 1.31572 6.94046C1.13062 6.00989 1.22562 5.04532 1.58872 4.16874C1.95181 3.29215 2.56669 2.54292 3.35559 2.0158ZM6.00481 8.60309C5.84641 8.60102 5.69509 8.53718 5.58308 8.42517C5.47107 8.31316 5.40722 8.16183 5.40515 8.00344V6.60422H4.00591C3.84687 6.60422 3.69434 6.54104 3.58189 6.42859C3.46943 6.31613 3.40625 6.1636 3.40625 6.00456C3.40625 5.84553 3.46943 5.693 3.58189 5.58054C3.69434 5.46809 3.84687 5.40491 4.00591 5.40491H5.40515V4.00572C5.40515 3.84668 5.46833 3.69416 5.58079 3.5817C5.69324 3.46924 5.84577 3.40607 6.00481 3.40607C6.16385 3.40607 6.31637 3.46924 6.42883 3.5817C6.54129 3.69416 6.60447 3.84668 6.60447 4.00572V5.40491H8.00362C8.16266 5.40491 8.31518 5.46809 8.42764 5.58054C8.5401 5.693 8.60328 5.84553 8.60328 6.00456C8.60328 6.1636 8.5401 6.31613 8.42764 6.42859C8.31518 6.54104 8.16266 6.60422 8.00362 6.60422H6.60447V8.00344C6.60239 8.16183 6.53855 8.31316 6.42654 8.42517C6.31453 8.53718 6.1632 8.60102 6.00481 8.60309Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SearchPlusIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SearchPlusIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.67596 11.0265C3.66604 11.688 4.83005 12.0411 6.0208 12.0411C6.81143 12.0411 7.59432 11.8854 8.32477 11.5828C8.86999 11.357 9.37802 11.0526 9.83311 10.6803L12.9768 13.8241C13.0322 13.8801 13.0982 13.9245 13.171 13.9548C13.2437 13.985 13.3218 14.0003 13.4006 14C13.4794 14.0003 13.5575 13.985 13.6302 13.9548C13.703 13.9245 13.769 13.8801 13.8244 13.8241C13.9367 13.7116 13.9997 13.5592 13.9997 13.4003C13.9997 13.2414 13.9367 13.089 13.8244 12.9765L10.6806 9.8328C11.0529 9.37773 11.3572 8.86972 11.5831 8.32452C11.8856 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0267 2.67572C10.3652 1.68564 9.42488 0.913972 8.32477 0.45829C7.22466 0.00260857 6.01412 -0.116618 4.84625 0.115686C3.67838 0.34799 2.60562 0.921393 1.76363 1.76338C0.921637 2.60537 0.348235 3.67813 0.11593 4.84601C-0.116374 6.01388 0.00285271 7.22441 0.458534 8.32452C0.914216 9.42464 1.68589 10.3649 2.67596 11.0265ZM3.35559 2.0158C4.14449 1.48867 5.07199 1.20731 6.0208 1.20731C7.29311 1.20731 8.51331 1.71274 9.41297 2.6124C10.3126 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5367 7.88088 10.0096 8.66978C9.48244 9.45868 8.73322 10.0736 7.85663 10.4367C6.98005 10.7997 6.01548 10.8947 5.0849 10.7096C4.15433 10.5245 3.29954 10.0676 2.62863 9.39674C1.95772 8.72583 1.50083 7.87104 1.31572 6.94046C1.13062 6.00989 1.22562 5.04532 1.58872 4.16874C1.95181 3.29215 2.56669 2.54292 3.35559 2.0158ZM6.00481 8.60309C5.84641 8.60102 5.69509 8.53718 5.58308 8.42517C5.47107 8.31316 5.40722 8.16183 5.40515 8.00344V6.60422H4.00591C3.84687 6.60422 3.69434 6.54104 3.58189 6.42859C3.46943 6.31613 3.40625 6.1636 3.40625 6.00456C3.40625 5.84553 3.46943 5.693 3.58189 5.58054C3.69434 5.46809 3.84687 5.40491 4.00591 5.40491H5.40515V4.00572C5.40515 3.84668 5.46833 3.69416 5.58079 3.5817C5.69324 3.46924 5.84577 3.40607 6.00481 3.40607C6.16385 3.40607 6.31637 3.46924 6.42883 3.5817C6.54129 3.69416 6.60447 3.84668 6.60447 4.00572V5.40491H8.00362C8.16266 5.40491 8.31518 5.46809 8.42764 5.58054C8.5401 5.693 8.60328 5.84553 8.60328 6.00456C8.60328 6.1636 8.5401 6.31613 8.42764 6.42859C8.31518 6.54104 8.16266 6.60422 8.00362 6.60422H6.60447V8.00344C6.60239 8.16183 6.53855 8.31316 6.42654 8.42517C6.31453 8.53718 6.1632 8.60102 6.00481 8.60309Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-sortalt.mjs
var SortAltIcon;
var init_primeng_icons_sortalt = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-sortalt.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SortAltIcon = class _SortAltIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SortAltIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SortAltIcon,
        isStandalone: true,
        selector: "SortAltIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M5.64515 3.61291C5.47353 3.61291 5.30192 3.54968 5.16644 3.4142L3.38708 1.63484L1.60773 3.4142C1.34579 3.67613 0.912244 3.67613 0.650309 3.4142C0.388374 3.15226 0.388374 2.71871 0.650309 2.45678L2.90837 0.198712C3.17031 -0.0632236 3.60386 -0.0632236 3.86579 0.198712L6.12386 2.45678C6.38579 2.71871 6.38579 3.15226 6.12386 3.4142C5.98837 3.54968 5.81676 3.61291 5.64515 3.61291Z"
                    fill="currentColor"
                />
                <path d="M3.38714 14C3.01681 14 2.70972 13.6929 2.70972 13.3226V0.677419C2.70972 0.307097 3.01681 0 3.38714 0C3.75746 0 4.06456 0.307097 4.06456 0.677419V13.3226C4.06456 13.6929 3.75746 14 3.38714 14Z" fill="currentColor" />
                <path
                    d="M10.6129 14C10.4413 14 10.2697 13.9368 10.1342 13.8013L7.87611 11.5432C7.61418 11.2813 7.61418 10.8477 7.87611 10.5858C8.13805 10.3239 8.5716 10.3239 8.83353 10.5858L10.6129 12.3652L12.3922 10.5858C12.6542 10.3239 13.0877 10.3239 13.3497 10.5858C13.6116 10.8477 13.6116 11.2813 13.3497 11.5432L11.0916 13.8013C10.9561 13.9368 10.7845 14 10.6129 14Z"
                    fill="currentColor"
                />
                <path d="M10.6129 14C10.2426 14 9.93552 13.6929 9.93552 13.3226V0.677419C9.93552 0.307097 10.2426 0 10.6129 0C10.9833 0 11.2904 0.307097 11.2904 0.677419V13.3226C11.2904 13.6929 10.9832 14 10.6129 14Z" fill="currentColor" />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SortAltIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SortAltIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M5.64515 3.61291C5.47353 3.61291 5.30192 3.54968 5.16644 3.4142L3.38708 1.63484L1.60773 3.4142C1.34579 3.67613 0.912244 3.67613 0.650309 3.4142C0.388374 3.15226 0.388374 2.71871 0.650309 2.45678L2.90837 0.198712C3.17031 -0.0632236 3.60386 -0.0632236 3.86579 0.198712L6.12386 2.45678C6.38579 2.71871 6.38579 3.15226 6.12386 3.4142C5.98837 3.54968 5.81676 3.61291 5.64515 3.61291Z"
                    fill="currentColor"
                />
                <path d="M3.38714 14C3.01681 14 2.70972 13.6929 2.70972 13.3226V0.677419C2.70972 0.307097 3.01681 0 3.38714 0C3.75746 0 4.06456 0.307097 4.06456 0.677419V13.3226C4.06456 13.6929 3.75746 14 3.38714 14Z" fill="currentColor" />
                <path
                    d="M10.6129 14C10.4413 14 10.2697 13.9368 10.1342 13.8013L7.87611 11.5432C7.61418 11.2813 7.61418 10.8477 7.87611 10.5858C8.13805 10.3239 8.5716 10.3239 8.83353 10.5858L10.6129 12.3652L12.3922 10.5858C12.6542 10.3239 13.0877 10.3239 13.3497 10.5858C13.6116 10.8477 13.6116 11.2813 13.3497 11.5432L11.0916 13.8013C10.9561 13.9368 10.7845 14 10.6129 14Z"
                    fill="currentColor"
                />
                <path d="M10.6129 14C10.2426 14 9.93552 13.6929 9.93552 13.3226V0.677419C9.93552 0.307097 10.2426 0 10.6129 0C10.9833 0 11.2904 0.307097 11.2904 0.677419V13.3226C11.2904 13.6929 10.9832 14 10.6129 14Z" fill="currentColor" />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-sortamountdown.mjs
var SortAmountDownIcon;
var init_primeng_icons_sortamountdown = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-sortamountdown.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SortAmountDownIcon = class _SortAmountDownIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SortAmountDownIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SortAmountDownIcon,
        isStandalone: true,
        selector: "SortAmountDownIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M4.93953 10.5858L3.83759 11.6877V0.677419C3.83759 0.307097 3.53049 0 3.16017 0C2.78985 0 2.48275 0.307097 2.48275 0.677419V11.6877L1.38082 10.5858C1.11888 10.3239 0.685331 10.3239 0.423396 10.5858C0.16146 10.8477 0.16146 11.2813 0.423396 11.5432L2.68146 13.8013C2.74469 13.8645 2.81694 13.9097 2.89823 13.9458C2.97952 13.9819 3.06985 14 3.16017 14C3.25049 14 3.33178 13.9819 3.42211 13.9458C3.5034 13.9097 3.57565 13.8645 3.63888 13.8013L5.89694 11.5432C6.15888 11.2813 6.15888 10.8477 5.89694 10.5858C5.63501 10.3239 5.20146 10.3239 4.93953 10.5858ZM13.0957 0H7.22468C6.85436 0 6.54726 0.307097 6.54726 0.677419C6.54726 1.04774 6.85436 1.35484 7.22468 1.35484H13.0957C13.466 1.35484 13.7731 1.04774 13.7731 0.677419C13.7731 0.307097 13.466 0 13.0957 0ZM7.22468 5.41935H9.48275C9.85307 5.41935 10.1602 5.72645 10.1602 6.09677C10.1602 6.4671 9.85307 6.77419 9.48275 6.77419H7.22468C6.85436 6.77419 6.54726 6.4671 6.54726 6.09677C6.54726 5.72645 6.85436 5.41935 7.22468 5.41935ZM7.6763 8.12903H7.22468C6.85436 8.12903 6.54726 8.43613 6.54726 8.80645C6.54726 9.17677 6.85436 9.48387 7.22468 9.48387H7.6763C8.04662 9.48387 8.35372 9.17677 8.35372 8.80645C8.35372 8.43613 8.04662 8.12903 7.6763 8.12903ZM7.22468 2.70968H11.2892C11.6595 2.70968 11.9666 3.01677 11.9666 3.3871C11.9666 3.75742 11.6595 4.06452 11.2892 4.06452H7.22468C6.85436 4.06452 6.54726 3.75742 6.54726 3.3871C6.54726 3.01677 6.85436 2.70968 7.22468 2.70968Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SortAmountDownIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SortAmountDownIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M4.93953 10.5858L3.83759 11.6877V0.677419C3.83759 0.307097 3.53049 0 3.16017 0C2.78985 0 2.48275 0.307097 2.48275 0.677419V11.6877L1.38082 10.5858C1.11888 10.3239 0.685331 10.3239 0.423396 10.5858C0.16146 10.8477 0.16146 11.2813 0.423396 11.5432L2.68146 13.8013C2.74469 13.8645 2.81694 13.9097 2.89823 13.9458C2.97952 13.9819 3.06985 14 3.16017 14C3.25049 14 3.33178 13.9819 3.42211 13.9458C3.5034 13.9097 3.57565 13.8645 3.63888 13.8013L5.89694 11.5432C6.15888 11.2813 6.15888 10.8477 5.89694 10.5858C5.63501 10.3239 5.20146 10.3239 4.93953 10.5858ZM13.0957 0H7.22468C6.85436 0 6.54726 0.307097 6.54726 0.677419C6.54726 1.04774 6.85436 1.35484 7.22468 1.35484H13.0957C13.466 1.35484 13.7731 1.04774 13.7731 0.677419C13.7731 0.307097 13.466 0 13.0957 0ZM7.22468 5.41935H9.48275C9.85307 5.41935 10.1602 5.72645 10.1602 6.09677C10.1602 6.4671 9.85307 6.77419 9.48275 6.77419H7.22468C6.85436 6.77419 6.54726 6.4671 6.54726 6.09677C6.54726 5.72645 6.85436 5.41935 7.22468 5.41935ZM7.6763 8.12903H7.22468C6.85436 8.12903 6.54726 8.43613 6.54726 8.80645C6.54726 9.17677 6.85436 9.48387 7.22468 9.48387H7.6763C8.04662 9.48387 8.35372 9.17677 8.35372 8.80645C8.35372 8.43613 8.04662 8.12903 7.6763 8.12903ZM7.22468 2.70968H11.2892C11.6595 2.70968 11.9666 3.01677 11.9666 3.3871C11.9666 3.75742 11.6595 4.06452 11.2892 4.06452H7.22468C6.85436 4.06452 6.54726 3.75742 6.54726 3.3871C6.54726 3.01677 6.85436 2.70968 7.22468 2.70968Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-sortamountupalt.mjs
var SortAmountUpAltIcon;
var init_primeng_icons_sortamountupalt = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-sortamountupalt.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SortAmountUpAltIcon = class _SortAmountUpAltIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SortAmountUpAltIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SortAmountUpAltIcon,
        isStandalone: true,
        selector: "SortAmountUpAltIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M3.63435 0.19871C3.57113 0.135484 3.49887 0.0903226 3.41758 0.0541935C3.255 -0.0180645 3.06532 -0.0180645 2.90274 0.0541935C2.82145 0.0903226 2.74919 0.135484 2.68597 0.19871L0.427901 2.45677C0.165965 2.71871 0.165965 3.15226 0.427901 3.41419C0.689836 3.67613 1.12338 3.67613 1.38532 3.41419L2.48726 2.31226V13.3226C2.48726 13.6929 2.79435 14 3.16467 14C3.535 14 3.84209 13.6929 3.84209 13.3226V2.31226L4.94403 3.41419C5.07951 3.54968 5.25113 3.6129 5.42274 3.6129C5.59435 3.6129 5.76597 3.54968 5.90145 3.41419C6.16338 3.15226 6.16338 2.71871 5.90145 2.45677L3.64338 0.19871H3.63435ZM13.7685 13.3226C13.7685 12.9523 13.4615 12.6452 13.0911 12.6452H7.22016C6.84984 12.6452 6.54274 12.9523 6.54274 13.3226C6.54274 13.6929 6.84984 14 7.22016 14H13.0911C13.4615 14 13.7685 13.6929 13.7685 13.3226ZM7.22016 8.58064C6.84984 8.58064 6.54274 8.27355 6.54274 7.90323C6.54274 7.5329 6.84984 7.22581 7.22016 7.22581H9.47823C9.84855 7.22581 10.1556 7.5329 10.1556 7.90323C10.1556 8.27355 9.84855 8.58064 9.47823 8.58064H7.22016ZM7.22016 5.87097H7.67177C8.0421 5.87097 8.34919 5.56387 8.34919 5.19355C8.34919 4.82323 8.0421 4.51613 7.67177 4.51613H7.22016C6.84984 4.51613 6.54274 4.82323 6.54274 5.19355C6.54274 5.56387 6.84984 5.87097 7.22016 5.87097ZM11.2847 11.2903H7.22016C6.84984 11.2903 6.54274 10.9832 6.54274 10.6129C6.54274 10.2426 6.84984 9.93548 7.22016 9.93548H11.2847C11.655 9.93548 11.9621 10.2426 11.9621 10.6129C11.9621 10.9832 11.655 11.2903 11.2847 11.2903Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SortAmountUpAltIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SortAmountUpAltIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M3.63435 0.19871C3.57113 0.135484 3.49887 0.0903226 3.41758 0.0541935C3.255 -0.0180645 3.06532 -0.0180645 2.90274 0.0541935C2.82145 0.0903226 2.74919 0.135484 2.68597 0.19871L0.427901 2.45677C0.165965 2.71871 0.165965 3.15226 0.427901 3.41419C0.689836 3.67613 1.12338 3.67613 1.38532 3.41419L2.48726 2.31226V13.3226C2.48726 13.6929 2.79435 14 3.16467 14C3.535 14 3.84209 13.6929 3.84209 13.3226V2.31226L4.94403 3.41419C5.07951 3.54968 5.25113 3.6129 5.42274 3.6129C5.59435 3.6129 5.76597 3.54968 5.90145 3.41419C6.16338 3.15226 6.16338 2.71871 5.90145 2.45677L3.64338 0.19871H3.63435ZM13.7685 13.3226C13.7685 12.9523 13.4615 12.6452 13.0911 12.6452H7.22016C6.84984 12.6452 6.54274 12.9523 6.54274 13.3226C6.54274 13.6929 6.84984 14 7.22016 14H13.0911C13.4615 14 13.7685 13.6929 13.7685 13.3226ZM7.22016 8.58064C6.84984 8.58064 6.54274 8.27355 6.54274 7.90323C6.54274 7.5329 6.84984 7.22581 7.22016 7.22581H9.47823C9.84855 7.22581 10.1556 7.5329 10.1556 7.90323C10.1556 8.27355 9.84855 8.58064 9.47823 8.58064H7.22016ZM7.22016 5.87097H7.67177C8.0421 5.87097 8.34919 5.56387 8.34919 5.19355C8.34919 4.82323 8.0421 4.51613 7.67177 4.51613H7.22016C6.84984 4.51613 6.54274 4.82323 6.54274 5.19355C6.54274 5.56387 6.84984 5.87097 7.22016 5.87097ZM11.2847 11.2903H7.22016C6.84984 11.2903 6.54274 10.9832 6.54274 10.6129C6.54274 10.2426 6.84984 9.93548 7.22016 9.93548H11.2847C11.655 9.93548 11.9621 10.2426 11.9621 10.6129C11.9621 10.9832 11.655 11.2903 11.2847 11.2903Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-spinner.mjs
var SpinnerIcon;
var init_primeng_icons_spinner = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-spinner.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    SpinnerIcon = class _SpinnerIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _SpinnerIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _SpinnerIcon,
        isStandalone: true,
        selector: "SpinnerIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: SpinnerIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "SpinnerIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-star.mjs
var StarIcon;
var init_primeng_icons_star = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-star.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    StarIcon = class _StarIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _StarIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _StarIcon,
        isStandalone: true,
        selector: "StarIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M10.9741 13.6721C10.8806 13.6719 10.7886 13.6483 10.7066 13.6033L7.00002 11.6545L3.29345 13.6033C3.19926 13.6539 3.09281 13.6771 2.98612 13.6703C2.87943 13.6636 2.77676 13.6271 2.6897 13.5651C2.60277 13.5014 2.53529 13.4147 2.4948 13.3148C2.45431 13.215 2.44241 13.1058 2.46042 12.9995L3.17881 8.87264L0.167699 5.95324C0.0922333 5.8777 0.039368 5.78258 0.0150625 5.67861C-0.00924303 5.57463 -0.00402231 5.46594 0.030136 5.36477C0.0621323 5.26323 0.122141 5.17278 0.203259 5.10383C0.284377 5.03488 0.383311 4.99023 0.488681 4.97501L4.63087 4.37126L6.48797 0.618832C6.54083 0.530159 6.61581 0.456732 6.70556 0.405741C6.79532 0.35475 6.89678 0.327942 7.00002 0.327942C7.10325 0.327942 7.20471 0.35475 7.29447 0.405741C7.38422 0.456732 7.4592 0.530159 7.51206 0.618832L9.36916 4.37126L13.5114 4.97501C13.6167 4.99023 13.7157 5.03488 13.7968 5.10383C13.8779 5.17278 13.9379 5.26323 13.9699 5.36477C14.0041 5.46594 14.0093 5.57463 13.985 5.67861C13.9607 5.78258 13.9078 5.8777 13.8323 5.95324L10.8212 8.87264L11.532 12.9995C11.55 13.1058 11.5381 13.215 11.4976 13.3148C11.4571 13.4147 11.3896 13.5014 11.3027 13.5651C11.2059 13.632 11.0917 13.6692 10.9741 13.6721ZM7.00002 10.4393C7.09251 10.4404 7.18371 10.4613 7.2675 10.5005L10.2098 12.029L9.65193 8.75036C9.6368 8.6584 9.64343 8.56418 9.6713 8.47526C9.69918 8.38633 9.74751 8.30518 9.81242 8.23832L12.1969 5.94559L8.90298 5.45648C8.81188 5.44198 8.72555 5.406 8.65113 5.35152C8.57671 5.29703 8.51633 5.2256 8.475 5.14314L7.00002 2.1626L5.52503 5.15078C5.4837 5.23324 5.42332 5.30467 5.3489 5.35916C5.27448 5.41365 5.18815 5.44963 5.09705 5.46412L1.80318 5.94559L4.18761 8.23832C4.25252 8.30518 4.30085 8.38633 4.32873 8.47526C4.3566 8.56418 4.36323 8.6584 4.3481 8.75036L3.7902 12.0519L6.73253 10.5234C6.81451 10.4762 6.9058 10.4475 7.00002 10.4393Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: StarIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "StarIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M10.9741 13.6721C10.8806 13.6719 10.7886 13.6483 10.7066 13.6033L7.00002 11.6545L3.29345 13.6033C3.19926 13.6539 3.09281 13.6771 2.98612 13.6703C2.87943 13.6636 2.77676 13.6271 2.6897 13.5651C2.60277 13.5014 2.53529 13.4147 2.4948 13.3148C2.45431 13.215 2.44241 13.1058 2.46042 12.9995L3.17881 8.87264L0.167699 5.95324C0.0922333 5.8777 0.039368 5.78258 0.0150625 5.67861C-0.00924303 5.57463 -0.00402231 5.46594 0.030136 5.36477C0.0621323 5.26323 0.122141 5.17278 0.203259 5.10383C0.284377 5.03488 0.383311 4.99023 0.488681 4.97501L4.63087 4.37126L6.48797 0.618832C6.54083 0.530159 6.61581 0.456732 6.70556 0.405741C6.79532 0.35475 6.89678 0.327942 7.00002 0.327942C7.10325 0.327942 7.20471 0.35475 7.29447 0.405741C7.38422 0.456732 7.4592 0.530159 7.51206 0.618832L9.36916 4.37126L13.5114 4.97501C13.6167 4.99023 13.7157 5.03488 13.7968 5.10383C13.8779 5.17278 13.9379 5.26323 13.9699 5.36477C14.0041 5.46594 14.0093 5.57463 13.985 5.67861C13.9607 5.78258 13.9078 5.8777 13.8323 5.95324L10.8212 8.87264L11.532 12.9995C11.55 13.1058 11.5381 13.215 11.4976 13.3148C11.4571 13.4147 11.3896 13.5014 11.3027 13.5651C11.2059 13.632 11.0917 13.6692 10.9741 13.6721ZM7.00002 10.4393C7.09251 10.4404 7.18371 10.4613 7.2675 10.5005L10.2098 12.029L9.65193 8.75036C9.6368 8.6584 9.64343 8.56418 9.6713 8.47526C9.69918 8.38633 9.74751 8.30518 9.81242 8.23832L12.1969 5.94559L8.90298 5.45648C8.81188 5.44198 8.72555 5.406 8.65113 5.35152C8.57671 5.29703 8.51633 5.2256 8.475 5.14314L7.00002 2.1626L5.52503 5.15078C5.4837 5.23324 5.42332 5.30467 5.3489 5.35916C5.27448 5.41365 5.18815 5.44963 5.09705 5.46412L1.80318 5.94559L4.18761 8.23832C4.25252 8.30518 4.30085 8.38633 4.32873 8.47526C4.3566 8.56418 4.36323 8.6584 4.3481 8.75036L3.7902 12.0519L6.73253 10.5234C6.81451 10.4762 6.9058 10.4475 7.00002 10.4393Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-starfill.mjs
var StarFillIcon;
var init_primeng_icons_starfill = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-starfill.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    StarFillIcon = class _StarFillIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _StarFillIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _StarFillIcon,
        isStandalone: true,
        selector: "StarFillIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M13.9718 5.36453C13.9398 5.26298 13.8798 5.17252 13.7986 5.10356C13.7175 5.0346 13.6186 4.98994 13.5132 4.97472L9.37043 4.37088L7.51307 0.617955C7.46021 0.529271 7.38522 0.455834 7.29545 0.404836C7.20568 0.353838 7.1042 0.327026 7.00096 0.327026C6.89771 0.327026 6.79624 0.353838 6.70647 0.404836C6.6167 0.455834 6.54171 0.529271 6.48885 0.617955L4.63149 4.37088L0.488746 4.97472C0.383363 4.98994 0.284416 5.0346 0.203286 5.10356C0.122157 5.17252 0.0621407 5.26298 0.03014 5.36453C-0.00402286 5.46571 -0.00924428 5.57442 0.0150645 5.67841C0.0393733 5.7824 0.0922457 5.87753 0.167722 5.95308L3.17924 8.87287L2.4684 13.0003C2.45038 13.1066 2.46229 13.2158 2.50278 13.3157C2.54328 13.4156 2.61077 13.5022 2.6977 13.5659C2.78477 13.628 2.88746 13.6644 2.99416 13.6712C3.10087 13.678 3.20733 13.6547 3.30153 13.6042L7.00096 11.6551L10.708 13.6042C10.79 13.6491 10.882 13.6728 10.9755 13.673C11.0958 13.6716 11.2129 13.6343 11.3119 13.5659C11.3988 13.5022 11.4663 13.4156 11.5068 13.3157C11.5473 13.2158 11.5592 13.1066 11.5412 13.0003L10.8227 8.87287L13.8266 5.95308C13.9033 5.87835 13.9577 5.7836 13.9833 5.67957C14.009 5.57554 14.005 5.4664 13.9718 5.36453Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: StarFillIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "StarFillIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    d="M13.9718 5.36453C13.9398 5.26298 13.8798 5.17252 13.7986 5.10356C13.7175 5.0346 13.6186 4.98994 13.5132 4.97472L9.37043 4.37088L7.51307 0.617955C7.46021 0.529271 7.38522 0.455834 7.29545 0.404836C7.20568 0.353838 7.1042 0.327026 7.00096 0.327026C6.89771 0.327026 6.79624 0.353838 6.70647 0.404836C6.6167 0.455834 6.54171 0.529271 6.48885 0.617955L4.63149 4.37088L0.488746 4.97472C0.383363 4.98994 0.284416 5.0346 0.203286 5.10356C0.122157 5.17252 0.0621407 5.26298 0.03014 5.36453C-0.00402286 5.46571 -0.00924428 5.57442 0.0150645 5.67841C0.0393733 5.7824 0.0922457 5.87753 0.167722 5.95308L3.17924 8.87287L2.4684 13.0003C2.45038 13.1066 2.46229 13.2158 2.50278 13.3157C2.54328 13.4156 2.61077 13.5022 2.6977 13.5659C2.78477 13.628 2.88746 13.6644 2.99416 13.6712C3.10087 13.678 3.20733 13.6547 3.30153 13.6042L7.00096 11.6551L10.708 13.6042C10.79 13.6491 10.882 13.6728 10.9755 13.673C11.0958 13.6716 11.2129 13.6343 11.3119 13.5659C11.3988 13.5022 11.4663 13.4156 11.5068 13.3157C11.5473 13.2158 11.5592 13.1066 11.5412 13.0003L10.8227 8.87287L13.8266 5.95308C13.9033 5.87835 13.9577 5.7836 13.9833 5.67957C14.009 5.57554 14.005 5.4664 13.9718 5.36453Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-thlarge.mjs
var ThLargeIcon;
var init_primeng_icons_thlarge = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-thlarge.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    ThLargeIcon = class _ThLargeIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ThLargeIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _ThLargeIcon,
        isStandalone: true,
        selector: "ThLargeIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.90909 6.36364H4.45455C4.96087 6.36364 5.44645 6.1625 5.80448 5.80448C6.1625 5.44645 6.36364 4.96087 6.36364 4.45455V1.90909C6.36364 1.40277 6.1625 0.917184 5.80448 0.55916C5.44645 0.201136 4.96087 0 4.45455 0H1.90909C1.40277 0 0.917184 0.201136 0.55916 0.55916C0.201136 0.917184 0 1.40277 0 1.90909V4.45455C0 4.96087 0.201136 5.44645 0.55916 5.80448C0.917184 6.1625 1.40277 6.36364 1.90909 6.36364ZM1.46154 1.46154C1.58041 1.34268 1.741 1.27492 1.90909 1.27273H4.45455C4.62264 1.27492 4.78322 1.34268 4.90209 1.46154C5.02096 1.58041 5.08871 1.741 5.09091 1.90909V4.45455C5.08871 4.62264 5.02096 4.78322 4.90209 4.90209C4.78322 5.02096 4.62264 5.08871 4.45455 5.09091H1.90909C1.741 5.08871 1.58041 5.02096 1.46154 4.90209C1.34268 4.78322 1.27492 4.62264 1.27273 4.45455V1.90909C1.27492 1.741 1.34268 1.58041 1.46154 1.46154ZM1.90909 14H4.45455C4.96087 14 5.44645 13.7989 5.80448 13.4408C6.1625 13.0828 6.36364 12.5972 6.36364 12.0909V9.54544C6.36364 9.03912 6.1625 8.55354 5.80448 8.19551C5.44645 7.83749 4.96087 7.63635 4.45455 7.63635H1.90909C1.40277 7.63635 0.917184 7.83749 0.55916 8.19551C0.201136 8.55354 0 9.03912 0 9.54544V12.0909C0 12.5972 0.201136 13.0828 0.55916 13.4408C0.917184 13.7989 1.40277 14 1.90909 14ZM1.46154 9.0979C1.58041 8.97903 1.741 8.91128 1.90909 8.90908H4.45455C4.62264 8.91128 4.78322 8.97903 4.90209 9.0979C5.02096 9.21677 5.08871 9.37735 5.09091 9.54544V12.0909C5.08871 12.259 5.02096 12.4196 4.90209 12.5384C4.78322 12.6573 4.62264 12.7251 4.45455 12.7273H1.90909C1.741 12.7251 1.58041 12.6573 1.46154 12.5384C1.34268 12.4196 1.27492 12.259 1.27273 12.0909V9.54544C1.27492 9.37735 1.34268 9.21677 1.46154 9.0979ZM12.0909 6.36364H9.54544C9.03912 6.36364 8.55354 6.1625 8.19551 5.80448C7.83749 5.44645 7.63635 4.96087 7.63635 4.45455V1.90909C7.63635 1.40277 7.83749 0.917184 8.19551 0.55916C8.55354 0.201136 9.03912 0 9.54544 0H12.0909C12.5972 0 13.0828 0.201136 13.4408 0.55916C13.7989 0.917184 14 1.40277 14 1.90909V4.45455C14 4.96087 13.7989 5.44645 13.4408 5.80448C13.0828 6.1625 12.5972 6.36364 12.0909 6.36364ZM9.54544 1.27273C9.37735 1.27492 9.21677 1.34268 9.0979 1.46154C8.97903 1.58041 8.91128 1.741 8.90908 1.90909V4.45455C8.91128 4.62264 8.97903 4.78322 9.0979 4.90209C9.21677 5.02096 9.37735 5.08871 9.54544 5.09091H12.0909C12.259 5.08871 12.4196 5.02096 12.5384 4.90209C12.6573 4.78322 12.7251 4.62264 12.7273 4.45455V1.90909C12.7251 1.741 12.6573 1.58041 12.5384 1.46154C12.4196 1.34268 12.259 1.27492 12.0909 1.27273H9.54544ZM9.54544 14H12.0909C12.5972 14 13.0828 13.7989 13.4408 13.4408C13.7989 13.0828 14 12.5972 14 12.0909V9.54544C14 9.03912 13.7989 8.55354 13.4408 8.19551C13.0828 7.83749 12.5972 7.63635 12.0909 7.63635H9.54544C9.03912 7.63635 8.55354 7.83749 8.19551 8.19551C7.83749 8.55354 7.63635 9.03912 7.63635 9.54544V12.0909C7.63635 12.5972 7.83749 13.0828 8.19551 13.4408C8.55354 13.7989 9.03912 14 9.54544 14ZM9.0979 9.0979C9.21677 8.97903 9.37735 8.91128 9.54544 8.90908H12.0909C12.259 8.91128 12.4196 8.97903 12.5384 9.0979C12.6573 9.21677 12.7251 9.37735 12.7273 9.54544V12.0909C12.7251 12.259 12.6573 12.4196 12.5384 12.5384C12.4196 12.6573 12.259 12.7251 12.0909 12.7273H9.54544C9.37735 12.7251 9.21677 12.6573 9.0979 12.5384C8.97903 12.4196 8.91128 12.259 8.90908 12.0909V9.54544C8.91128 9.37735 8.97903 9.21677 9.0979 9.0979Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ThLargeIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "ThLargeIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.90909 6.36364H4.45455C4.96087 6.36364 5.44645 6.1625 5.80448 5.80448C6.1625 5.44645 6.36364 4.96087 6.36364 4.45455V1.90909C6.36364 1.40277 6.1625 0.917184 5.80448 0.55916C5.44645 0.201136 4.96087 0 4.45455 0H1.90909C1.40277 0 0.917184 0.201136 0.55916 0.55916C0.201136 0.917184 0 1.40277 0 1.90909V4.45455C0 4.96087 0.201136 5.44645 0.55916 5.80448C0.917184 6.1625 1.40277 6.36364 1.90909 6.36364ZM1.46154 1.46154C1.58041 1.34268 1.741 1.27492 1.90909 1.27273H4.45455C4.62264 1.27492 4.78322 1.34268 4.90209 1.46154C5.02096 1.58041 5.08871 1.741 5.09091 1.90909V4.45455C5.08871 4.62264 5.02096 4.78322 4.90209 4.90209C4.78322 5.02096 4.62264 5.08871 4.45455 5.09091H1.90909C1.741 5.08871 1.58041 5.02096 1.46154 4.90209C1.34268 4.78322 1.27492 4.62264 1.27273 4.45455V1.90909C1.27492 1.741 1.34268 1.58041 1.46154 1.46154ZM1.90909 14H4.45455C4.96087 14 5.44645 13.7989 5.80448 13.4408C6.1625 13.0828 6.36364 12.5972 6.36364 12.0909V9.54544C6.36364 9.03912 6.1625 8.55354 5.80448 8.19551C5.44645 7.83749 4.96087 7.63635 4.45455 7.63635H1.90909C1.40277 7.63635 0.917184 7.83749 0.55916 8.19551C0.201136 8.55354 0 9.03912 0 9.54544V12.0909C0 12.5972 0.201136 13.0828 0.55916 13.4408C0.917184 13.7989 1.40277 14 1.90909 14ZM1.46154 9.0979C1.58041 8.97903 1.741 8.91128 1.90909 8.90908H4.45455C4.62264 8.91128 4.78322 8.97903 4.90209 9.0979C5.02096 9.21677 5.08871 9.37735 5.09091 9.54544V12.0909C5.08871 12.259 5.02096 12.4196 4.90209 12.5384C4.78322 12.6573 4.62264 12.7251 4.45455 12.7273H1.90909C1.741 12.7251 1.58041 12.6573 1.46154 12.5384C1.34268 12.4196 1.27492 12.259 1.27273 12.0909V9.54544C1.27492 9.37735 1.34268 9.21677 1.46154 9.0979ZM12.0909 6.36364H9.54544C9.03912 6.36364 8.55354 6.1625 8.19551 5.80448C7.83749 5.44645 7.63635 4.96087 7.63635 4.45455V1.90909C7.63635 1.40277 7.83749 0.917184 8.19551 0.55916C8.55354 0.201136 9.03912 0 9.54544 0H12.0909C12.5972 0 13.0828 0.201136 13.4408 0.55916C13.7989 0.917184 14 1.40277 14 1.90909V4.45455C14 4.96087 13.7989 5.44645 13.4408 5.80448C13.0828 6.1625 12.5972 6.36364 12.0909 6.36364ZM9.54544 1.27273C9.37735 1.27492 9.21677 1.34268 9.0979 1.46154C8.97903 1.58041 8.91128 1.741 8.90908 1.90909V4.45455C8.91128 4.62264 8.97903 4.78322 9.0979 4.90209C9.21677 5.02096 9.37735 5.08871 9.54544 5.09091H12.0909C12.259 5.08871 12.4196 5.02096 12.5384 4.90209C12.6573 4.78322 12.7251 4.62264 12.7273 4.45455V1.90909C12.7251 1.741 12.6573 1.58041 12.5384 1.46154C12.4196 1.34268 12.259 1.27492 12.0909 1.27273H9.54544ZM9.54544 14H12.0909C12.5972 14 13.0828 13.7989 13.4408 13.4408C13.7989 13.0828 14 12.5972 14 12.0909V9.54544C14 9.03912 13.7989 8.55354 13.4408 8.19551C13.0828 7.83749 12.5972 7.63635 12.0909 7.63635H9.54544C9.03912 7.63635 8.55354 7.83749 8.19551 8.19551C7.83749 8.55354 7.63635 9.03912 7.63635 9.54544V12.0909C7.63635 12.5972 7.83749 13.0828 8.19551 13.4408C8.55354 13.7989 9.03912 14 9.54544 14ZM9.0979 9.0979C9.21677 8.97903 9.37735 8.91128 9.54544 8.90908H12.0909C12.259 8.91128 12.4196 8.97903 12.5384 9.0979C12.6573 9.21677 12.7251 9.37735 12.7273 9.54544V12.0909C12.7251 12.259 12.6573 12.4196 12.5384 12.5384C12.4196 12.6573 12.259 12.7251 12.0909 12.7273H9.54544C9.37735 12.7251 9.21677 12.6573 9.0979 12.5384C8.97903 12.4196 8.91128 12.259 8.90908 12.0909V9.54544C8.91128 9.37735 8.97903 9.21677 9.0979 9.0979Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-times.mjs
var TimesIcon;
var init_primeng_icons_times = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-times.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_primeng_icons_baseicon();
    TimesIcon = class _TimesIcon extends BaseIcon {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _TimesIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _TimesIcon,
        isStandalone: true,
        selector: "TimesIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z"
                fill="currentColor"
            />
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: TimesIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "TimesIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <path
                d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z"
                fill="currentColor"
            />
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-timescircle.mjs
var TimesCircleIcon;
var init_primeng_icons_timescircle = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-timescircle.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    TimesCircleIcon = class _TimesCircleIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _TimesCircleIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _TimesCircleIcon,
        isStandalone: true,
        selector: "TimesCircleIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7 14C5.61553 14 4.26215 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303296 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303296 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26215 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.16667C5.84628 1.16667 4.71846 1.50879 3.75918 2.14976C2.79989 2.79074 2.05222 3.70178 1.61071 4.76768C1.16919 5.83358 1.05367 7.00647 1.27876 8.13803C1.50384 9.26958 2.05941 10.309 2.87521 11.1248C3.69102 11.9406 4.73042 12.4962 5.86198 12.7212C6.99353 12.9463 8.16642 12.8308 9.23232 12.3893C10.2982 11.9478 11.2093 11.2001 11.8502 10.2408C12.4912 9.28154 12.8333 8.15373 12.8333 7C12.8333 5.45291 12.2188 3.96918 11.1248 2.87521C10.0308 1.78125 8.5471 1.16667 7 1.16667ZM4.66662 9.91668C4.58998 9.91704 4.51404 9.90209 4.44325 9.87271C4.37246 9.84333 4.30826 9.8001 4.2544 9.74557C4.14516 9.6362 4.0838 9.48793 4.0838 9.33335C4.0838 9.17876 4.14516 9.0305 4.2544 8.92113L6.17553 7L4.25443 5.07891C4.15139 4.96832 4.09529 4.82207 4.09796 4.67094C4.10063 4.51982 4.16185 4.37563 4.26872 4.26876C4.3756 4.16188 4.51979 4.10066 4.67091 4.09799C4.82204 4.09532 4.96829 4.15142 5.07887 4.25446L6.99997 6.17556L8.92106 4.25446C9.03164 4.15142 9.1779 4.09532 9.32903 4.09799C9.48015 4.10066 9.62434 4.16188 9.73121 4.26876C9.83809 4.37563 9.89931 4.51982 9.90198 4.67094C9.90464 4.82207 9.84855 4.96832 9.74551 5.07891L7.82441 7L9.74554 8.92113C9.85478 9.0305 9.91614 9.17876 9.91614 9.33335C9.91614 9.48793 9.85478 9.6362 9.74554 9.74557C9.69168 9.8001 9.62748 9.84333 9.55669 9.87271C9.4859 9.90209 9.40996 9.91704 9.33332 9.91668C9.25668 9.91704 9.18073 9.90209 9.10995 9.87271C9.03916 9.84333 8.97495 9.8001 8.9211 9.74557L6.99997 7.82444L5.07884 9.74557C5.02499 9.8001 4.96078 9.84333 4.88999 9.87271C4.81921 9.90209 4.74326 9.91704 4.66662 9.91668Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: TimesCircleIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "TimesCircleIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7 14C5.61553 14 4.26215 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303296 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303296 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26215 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.16667C5.84628 1.16667 4.71846 1.50879 3.75918 2.14976C2.79989 2.79074 2.05222 3.70178 1.61071 4.76768C1.16919 5.83358 1.05367 7.00647 1.27876 8.13803C1.50384 9.26958 2.05941 10.309 2.87521 11.1248C3.69102 11.9406 4.73042 12.4962 5.86198 12.7212C6.99353 12.9463 8.16642 12.8308 9.23232 12.3893C10.2982 11.9478 11.2093 11.2001 11.8502 10.2408C12.4912 9.28154 12.8333 8.15373 12.8333 7C12.8333 5.45291 12.2188 3.96918 11.1248 2.87521C10.0308 1.78125 8.5471 1.16667 7 1.16667ZM4.66662 9.91668C4.58998 9.91704 4.51404 9.90209 4.44325 9.87271C4.37246 9.84333 4.30826 9.8001 4.2544 9.74557C4.14516 9.6362 4.0838 9.48793 4.0838 9.33335C4.0838 9.17876 4.14516 9.0305 4.2544 8.92113L6.17553 7L4.25443 5.07891C4.15139 4.96832 4.09529 4.82207 4.09796 4.67094C4.10063 4.51982 4.16185 4.37563 4.26872 4.26876C4.3756 4.16188 4.51979 4.10066 4.67091 4.09799C4.82204 4.09532 4.96829 4.15142 5.07887 4.25446L6.99997 6.17556L8.92106 4.25446C9.03164 4.15142 9.1779 4.09532 9.32903 4.09799C9.48015 4.10066 9.62434 4.16188 9.73121 4.26876C9.83809 4.37563 9.89931 4.51982 9.90198 4.67094C9.90464 4.82207 9.84855 4.96832 9.74551 5.07891L7.82441 7L9.74554 8.92113C9.85478 9.0305 9.91614 9.17876 9.91614 9.33335C9.91614 9.48793 9.85478 9.6362 9.74554 9.74557C9.69168 9.8001 9.62748 9.84333 9.55669 9.87271C9.4859 9.90209 9.40996 9.91704 9.33332 9.91668C9.25668 9.91704 9.18073 9.90209 9.10995 9.87271C9.03916 9.84333 8.97495 9.8001 8.9211 9.74557L6.99997 7.82444L5.07884 9.74557C5.02499 9.8001 4.96078 9.84333 4.88999 9.87271C4.81921 9.90209 4.74326 9.91704 4.66662 9.91668Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-trash.mjs
var TrashIcon;
var init_primeng_icons_trash = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-trash.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    TrashIcon = class _TrashIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _TrashIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _TrashIcon,
        isStandalone: true,
        selector: "TrashIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.44802 13.9955H10.552C10.8056 14.0129 11.06 13.9797 11.3006 13.898C11.5412 13.8163 11.7632 13.6877 11.9537 13.5196C12.1442 13.3515 12.2995 13.1473 12.4104 12.9188C12.5213 12.6903 12.5858 12.442 12.6 12.1884V4.36041H13.4C13.5591 4.36041 13.7117 4.29722 13.8243 4.18476C13.9368 4.07229 14 3.91976 14 3.76071C14 3.60166 13.9368 3.44912 13.8243 3.33666C13.7117 3.22419 13.5591 3.16101 13.4 3.16101H12.0537C12.0203 3.1557 11.9863 3.15299 11.952 3.15299C11.9178 3.15299 11.8838 3.1557 11.8503 3.16101H11.2285C11.2421 3.10893 11.2487 3.05513 11.248 3.00106V1.80966C11.2171 1.30262 10.9871 0.828306 10.608 0.48989C10.229 0.151475 9.73159 -0.0236625 9.22402 0.00257442H4.77602C4.27251 -0.0171866 3.78126 0.160868 3.40746 0.498617C3.03365 0.836366 2.807 1.30697 2.77602 1.80966V3.00106C2.77602 3.0556 2.78346 3.10936 2.79776 3.16101H0.6C0.521207 3.16101 0.443185 3.17652 0.37039 3.20666C0.297595 3.2368 0.231451 3.28097 0.175736 3.33666C0.120021 3.39235 0.0758251 3.45846 0.0456722 3.53121C0.0155194 3.60397 0 3.68196 0 3.76071C0 3.83946 0.0155194 3.91744 0.0456722 3.9902C0.0758251 4.06296 0.120021 4.12907 0.175736 4.18476C0.231451 4.24045 0.297595 4.28462 0.37039 4.31476C0.443185 4.3449 0.521207 4.36041 0.6 4.36041H1.40002V12.1884C1.41426 12.442 1.47871 12.6903 1.58965 12.9188C1.7006 13.1473 1.85582 13.3515 2.04633 13.5196C2.23683 13.6877 2.45882 13.8163 2.69944 13.898C2.94005 13.9797 3.1945 14.0129 3.44802 13.9955ZM2.60002 4.36041H11.304V12.1884C11.304 12.5163 10.952 12.7961 10.504 12.7961H3.40002C2.97602 12.7961 2.60002 12.5163 2.60002 12.1884V4.36041ZM3.95429 3.16101C3.96859 3.10936 3.97602 3.0556 3.97602 3.00106V1.80966C3.97602 1.48183 4.33602 1.20197 4.77602 1.20197H9.24802C9.66403 1.20197 10.048 1.48183 10.048 1.80966V3.00106C10.0473 3.05515 10.054 3.10896 10.0678 3.16101H3.95429ZM5.57571 10.997C5.41731 10.995 5.26597 10.9311 5.15395 10.8191C5.04193 10.7071 4.97808 10.5558 4.97601 10.3973V6.77517C4.97601 6.61612 5.0392 6.46359 5.15166 6.35112C5.26413 6.23866 5.41666 6.17548 5.57571 6.17548C5.73476 6.17548 5.8873 6.23866 5.99976 6.35112C6.11223 6.46359 6.17541 6.61612 6.17541 6.77517V10.3894C6.17647 10.4688 6.16174 10.5476 6.13208 10.6213C6.10241 10.695 6.05841 10.762 6.00261 10.8186C5.94682 10.8751 5.88035 10.92 5.80707 10.9506C5.73378 10.9813 5.65514 10.9971 5.57571 10.997ZM7.99968 10.8214C8.11215 10.9339 8.26468 10.997 8.42373 10.997C8.58351 10.9949 8.73604 10.93 8.84828 10.8163C8.96052 10.7025 9.02345 10.5491 9.02343 10.3894V6.77517C9.02343 6.61612 8.96025 6.46359 8.84778 6.35112C8.73532 6.23866 8.58278 6.17548 8.42373 6.17548C8.26468 6.17548 8.11215 6.23866 7.99968 6.35112C7.88722 6.46359 7.82404 6.61612 7.82404 6.77517V10.3973C7.82404 10.5564 7.88722 10.7089 7.99968 10.8214Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: TrashIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "TrashIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.44802 13.9955H10.552C10.8056 14.0129 11.06 13.9797 11.3006 13.898C11.5412 13.8163 11.7632 13.6877 11.9537 13.5196C12.1442 13.3515 12.2995 13.1473 12.4104 12.9188C12.5213 12.6903 12.5858 12.442 12.6 12.1884V4.36041H13.4C13.5591 4.36041 13.7117 4.29722 13.8243 4.18476C13.9368 4.07229 14 3.91976 14 3.76071C14 3.60166 13.9368 3.44912 13.8243 3.33666C13.7117 3.22419 13.5591 3.16101 13.4 3.16101H12.0537C12.0203 3.1557 11.9863 3.15299 11.952 3.15299C11.9178 3.15299 11.8838 3.1557 11.8503 3.16101H11.2285C11.2421 3.10893 11.2487 3.05513 11.248 3.00106V1.80966C11.2171 1.30262 10.9871 0.828306 10.608 0.48989C10.229 0.151475 9.73159 -0.0236625 9.22402 0.00257442H4.77602C4.27251 -0.0171866 3.78126 0.160868 3.40746 0.498617C3.03365 0.836366 2.807 1.30697 2.77602 1.80966V3.00106C2.77602 3.0556 2.78346 3.10936 2.79776 3.16101H0.6C0.521207 3.16101 0.443185 3.17652 0.37039 3.20666C0.297595 3.2368 0.231451 3.28097 0.175736 3.33666C0.120021 3.39235 0.0758251 3.45846 0.0456722 3.53121C0.0155194 3.60397 0 3.68196 0 3.76071C0 3.83946 0.0155194 3.91744 0.0456722 3.9902C0.0758251 4.06296 0.120021 4.12907 0.175736 4.18476C0.231451 4.24045 0.297595 4.28462 0.37039 4.31476C0.443185 4.3449 0.521207 4.36041 0.6 4.36041H1.40002V12.1884C1.41426 12.442 1.47871 12.6903 1.58965 12.9188C1.7006 13.1473 1.85582 13.3515 2.04633 13.5196C2.23683 13.6877 2.45882 13.8163 2.69944 13.898C2.94005 13.9797 3.1945 14.0129 3.44802 13.9955ZM2.60002 4.36041H11.304V12.1884C11.304 12.5163 10.952 12.7961 10.504 12.7961H3.40002C2.97602 12.7961 2.60002 12.5163 2.60002 12.1884V4.36041ZM3.95429 3.16101C3.96859 3.10936 3.97602 3.0556 3.97602 3.00106V1.80966C3.97602 1.48183 4.33602 1.20197 4.77602 1.20197H9.24802C9.66403 1.20197 10.048 1.48183 10.048 1.80966V3.00106C10.0473 3.05515 10.054 3.10896 10.0678 3.16101H3.95429ZM5.57571 10.997C5.41731 10.995 5.26597 10.9311 5.15395 10.8191C5.04193 10.7071 4.97808 10.5558 4.97601 10.3973V6.77517C4.97601 6.61612 5.0392 6.46359 5.15166 6.35112C5.26413 6.23866 5.41666 6.17548 5.57571 6.17548C5.73476 6.17548 5.8873 6.23866 5.99976 6.35112C6.11223 6.46359 6.17541 6.61612 6.17541 6.77517V10.3894C6.17647 10.4688 6.16174 10.5476 6.13208 10.6213C6.10241 10.695 6.05841 10.762 6.00261 10.8186C5.94682 10.8751 5.88035 10.92 5.80707 10.9506C5.73378 10.9813 5.65514 10.9971 5.57571 10.997ZM7.99968 10.8214C8.11215 10.9339 8.26468 10.997 8.42373 10.997C8.58351 10.9949 8.73604 10.93 8.84828 10.8163C8.96052 10.7025 9.02345 10.5491 9.02343 10.3894V6.77517C9.02343 6.61612 8.96025 6.46359 8.84778 6.35112C8.73532 6.23866 8.58278 6.17548 8.42373 6.17548C8.26468 6.17548 8.11215 6.23866 7.99968 6.35112C7.88722 6.46359 7.82404 6.61612 7.82404 6.77517V10.3973C7.82404 10.5564 7.88722 10.7089 7.99968 10.8214Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-undo.mjs
var UndoIcon;
var init_primeng_icons_undo = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-undo.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    UndoIcon = class _UndoIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _UndoIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _UndoIcon,
        isStandalone: true,
        selector: "UndoIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.77042 5.96336C6.84315 5.99355 6.92118 6.00891 6.99993 6.00854C7.07868 6.00891 7.15671 5.99355 7.22944 5.96336C7.30217 5.93317 7.36814 5.88876 7.42348 5.83273C7.53572 5.72035 7.59876 5.56801 7.59876 5.40918C7.59876 5.25035 7.53572 5.09802 7.42348 4.98564L6.04897 3.61113H6.99998C7.9088 3.61113 8.79722 3.88063 9.55288 4.38554C10.3085 4.89046 10.8975 5.60811 11.2453 6.44776C11.5931 7.2874 11.6841 8.21132 11.5068 9.10268C11.3295 9.99404 10.8918 10.8128 10.2492 11.4554C9.60657 12.0981 8.7878 12.5357 7.89644 12.713C7.00508 12.8903 6.08116 12.7993 5.24152 12.4515C4.40188 12.1037 3.68422 11.5148 3.17931 10.7591C2.67439 10.0035 2.4049 9.11504 2.4049 8.20622C2.4049 8.04726 2.34175 7.89481 2.22935 7.78241C2.11695 7.67001 1.9645 7.60686 1.80554 7.60686C1.64658 7.60686 1.49413 7.67001 1.38172 7.78241C1.26932 7.89481 1.20618 8.04726 1.20618 8.20622C1.20829 9.74218 1.81939 11.2146 2.90548 12.3007C3.99157 13.3868 5.46402 13.9979 6.99998 14C8.5366 14 10.0103 13.3896 11.0968 12.3031C12.1834 11.2165 12.7938 9.74283 12.7938 8.20622C12.7938 6.66961 12.1834 5.19593 11.0968 4.10938C10.0103 3.02283 8.5366 2.41241 6.99998 2.41241H6.04892L7.42348 1.03786C7.48236 0.982986 7.5296 0.916817 7.56235 0.843296C7.59511 0.769775 7.61273 0.690409 7.61415 0.609933C7.61557 0.529456 7.60076 0.449519 7.57062 0.374888C7.54047 0.300257 7.49561 0.232462 7.43869 0.175548C7.38178 0.118634 7.31398 0.0737664 7.23935 0.0436218C7.16472 0.0134773 7.08478 -0.00132663 7.00431 9.32772e-05C6.92383 0.00151319 6.84447 0.019128 6.77095 0.0518865C6.69742 0.0846451 6.63126 0.131876 6.57638 0.190763L4.17895 2.5882C4.06671 2.70058 4.00366 2.85292 4.00366 3.01175C4.00366 3.17058 4.06671 3.32291 4.17895 3.43529L6.57638 5.83273C6.63172 5.88876 6.69769 5.93317 6.77042 5.96336Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: UndoIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "UndoIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.77042 5.96336C6.84315 5.99355 6.92118 6.00891 6.99993 6.00854C7.07868 6.00891 7.15671 5.99355 7.22944 5.96336C7.30217 5.93317 7.36814 5.88876 7.42348 5.83273C7.53572 5.72035 7.59876 5.56801 7.59876 5.40918C7.59876 5.25035 7.53572 5.09802 7.42348 4.98564L6.04897 3.61113H6.99998C7.9088 3.61113 8.79722 3.88063 9.55288 4.38554C10.3085 4.89046 10.8975 5.60811 11.2453 6.44776C11.5931 7.2874 11.6841 8.21132 11.5068 9.10268C11.3295 9.99404 10.8918 10.8128 10.2492 11.4554C9.60657 12.0981 8.7878 12.5357 7.89644 12.713C7.00508 12.8903 6.08116 12.7993 5.24152 12.4515C4.40188 12.1037 3.68422 11.5148 3.17931 10.7591C2.67439 10.0035 2.4049 9.11504 2.4049 8.20622C2.4049 8.04726 2.34175 7.89481 2.22935 7.78241C2.11695 7.67001 1.9645 7.60686 1.80554 7.60686C1.64658 7.60686 1.49413 7.67001 1.38172 7.78241C1.26932 7.89481 1.20618 8.04726 1.20618 8.20622C1.20829 9.74218 1.81939 11.2146 2.90548 12.3007C3.99157 13.3868 5.46402 13.9979 6.99998 14C8.5366 14 10.0103 13.3896 11.0968 12.3031C12.1834 11.2165 12.7938 9.74283 12.7938 8.20622C12.7938 6.66961 12.1834 5.19593 11.0968 4.10938C10.0103 3.02283 8.5366 2.41241 6.99998 2.41241H6.04892L7.42348 1.03786C7.48236 0.982986 7.5296 0.916817 7.56235 0.843296C7.59511 0.769775 7.61273 0.690409 7.61415 0.609933C7.61557 0.529456 7.60076 0.449519 7.57062 0.374888C7.54047 0.300257 7.49561 0.232462 7.43869 0.175548C7.38178 0.118634 7.31398 0.0737664 7.23935 0.0436218C7.16472 0.0134773 7.08478 -0.00132663 7.00431 9.32772e-05C6.92383 0.00151319 6.84447 0.019128 6.77095 0.0518865C6.69742 0.0846451 6.63126 0.131876 6.57638 0.190763L4.17895 2.5882C4.06671 2.70058 4.00366 2.85292 4.00366 3.01175C4.00366 3.17058 4.06671 3.32291 4.17895 3.43529L6.57638 5.83273C6.63172 5.88876 6.69769 5.93317 6.77042 5.96336Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-upload.mjs
var UploadIcon;
var init_primeng_icons_upload = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-upload.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    UploadIcon = class _UploadIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _UploadIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _UploadIcon,
        isStandalone: true,
        selector: "UploadIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.58942 9.82197C6.70165 9.93405 6.85328 9.99793 7.012 10C7.17071 9.99793 7.32234 9.93405 7.43458 9.82197C7.54681 9.7099 7.61079 9.55849 7.61286 9.4V2.04798L9.79204 4.22402C9.84752 4.28011 9.91365 4.32457 9.98657 4.35479C10.0595 4.38502 10.1377 4.40039 10.2167 4.40002C10.2956 4.40039 10.3738 4.38502 10.4467 4.35479C10.5197 4.32457 10.5858 4.28011 10.6413 4.22402C10.7538 4.11152 10.817 3.95902 10.817 3.80002C10.817 3.64102 10.7538 3.48852 10.6413 3.37602L7.45127 0.190618C7.44656 0.185584 7.44176 0.180622 7.43687 0.175736C7.32419 0.063214 7.17136 0 7.012 0C6.85264 0 6.69981 0.063214 6.58712 0.175736C6.58181 0.181045 6.5766 0.186443 6.5715 0.191927L3.38282 3.37602C3.27669 3.48976 3.2189 3.6402 3.22165 3.79564C3.2244 3.95108 3.28746 4.09939 3.39755 4.20932C3.50764 4.31925 3.65616 4.38222 3.81182 4.38496C3.96749 4.3877 4.11814 4.33001 4.23204 4.22402L6.41113 2.04807V9.4C6.41321 9.55849 6.47718 9.7099 6.58942 9.82197ZM11.9952 14H2.02883C1.751 13.9887 1.47813 13.9228 1.22584 13.8061C0.973545 13.6894 0.746779 13.5241 0.558517 13.3197C0.370254 13.1154 0.22419 12.876 0.128681 12.6152C0.0331723 12.3545 -0.00990605 12.0775 0.0019109 11.8V9.40005C0.0019109 9.24092 0.065216 9.08831 0.1779 8.97579C0.290584 8.86326 0.443416 8.80005 0.602775 8.80005C0.762134 8.80005 0.914966 8.86326 1.02765 8.97579C1.14033 9.08831 1.20364 9.24092 1.20364 9.40005V11.8C1.18295 12.0376 1.25463 12.274 1.40379 12.4602C1.55296 12.6463 1.76817 12.7681 2.00479 12.8H11.9952C12.2318 12.7681 12.447 12.6463 12.5962 12.4602C12.7453 12.274 12.817 12.0376 12.7963 11.8V9.40005C12.7963 9.24092 12.8596 9.08831 12.9723 8.97579C13.085 8.86326 13.2378 8.80005 13.3972 8.80005C13.5565 8.80005 13.7094 8.86326 13.8221 8.97579C13.9347 9.08831 13.998 9.24092 13.998 9.40005V11.8C14.022 12.3563 13.8251 12.8996 13.45 13.3116C13.0749 13.7236 12.552 13.971 11.9952 14Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: UploadIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "UploadIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.58942 9.82197C6.70165 9.93405 6.85328 9.99793 7.012 10C7.17071 9.99793 7.32234 9.93405 7.43458 9.82197C7.54681 9.7099 7.61079 9.55849 7.61286 9.4V2.04798L9.79204 4.22402C9.84752 4.28011 9.91365 4.32457 9.98657 4.35479C10.0595 4.38502 10.1377 4.40039 10.2167 4.40002C10.2956 4.40039 10.3738 4.38502 10.4467 4.35479C10.5197 4.32457 10.5858 4.28011 10.6413 4.22402C10.7538 4.11152 10.817 3.95902 10.817 3.80002C10.817 3.64102 10.7538 3.48852 10.6413 3.37602L7.45127 0.190618C7.44656 0.185584 7.44176 0.180622 7.43687 0.175736C7.32419 0.063214 7.17136 0 7.012 0C6.85264 0 6.69981 0.063214 6.58712 0.175736C6.58181 0.181045 6.5766 0.186443 6.5715 0.191927L3.38282 3.37602C3.27669 3.48976 3.2189 3.6402 3.22165 3.79564C3.2244 3.95108 3.28746 4.09939 3.39755 4.20932C3.50764 4.31925 3.65616 4.38222 3.81182 4.38496C3.96749 4.3877 4.11814 4.33001 4.23204 4.22402L6.41113 2.04807V9.4C6.41321 9.55849 6.47718 9.7099 6.58942 9.82197ZM11.9952 14H2.02883C1.751 13.9887 1.47813 13.9228 1.22584 13.8061C0.973545 13.6894 0.746779 13.5241 0.558517 13.3197C0.370254 13.1154 0.22419 12.876 0.128681 12.6152C0.0331723 12.3545 -0.00990605 12.0775 0.0019109 11.8V9.40005C0.0019109 9.24092 0.065216 9.08831 0.1779 8.97579C0.290584 8.86326 0.443416 8.80005 0.602775 8.80005C0.762134 8.80005 0.914966 8.86326 1.02765 8.97579C1.14033 9.08831 1.20364 9.24092 1.20364 9.40005V11.8C1.18295 12.0376 1.25463 12.274 1.40379 12.4602C1.55296 12.6463 1.76817 12.7681 2.00479 12.8H11.9952C12.2318 12.7681 12.447 12.6463 12.5962 12.4602C12.7453 12.274 12.817 12.0376 12.7963 11.8V9.40005C12.7963 9.24092 12.8596 9.08831 12.9723 8.97579C13.085 8.86326 13.2378 8.80005 13.3972 8.80005C13.5565 8.80005 13.7094 8.86326 13.8221 8.97579C13.9347 9.08831 13.998 9.24092 13.998 9.40005V11.8C14.022 12.3563 13.8251 12.8996 13.45 13.3116C13.0749 13.7236 12.552 13.971 11.9952 14Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-windowmaximize.mjs
var WindowMaximizeIcon;
var init_primeng_icons_windowmaximize = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-windowmaximize.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    WindowMaximizeIcon = class _WindowMaximizeIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _WindowMaximizeIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _WindowMaximizeIcon,
        isStandalone: true,
        selector: "WindowMaximizeIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: WindowMaximizeIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "WindowMaximizeIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons-windowminimize.mjs
var WindowMinimizeIcon;
var init_primeng_icons_windowminimize = __esm({
  "node_modules/primeng/fesm2022/primeng-icons-windowminimize.mjs"() {
    "use strict";
    init_core();
    init_core();
    init_utils();
    init_primeng_icons_baseicon();
    WindowMinimizeIcon = class _WindowMinimizeIcon extends BaseIcon {
      pathId;
      ngOnInit() {
        this.pathId = "url(#" + uuid() + ")";
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _WindowMinimizeIcon,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "14.0.0",
        version: "19.2.10",
        type: _WindowMinimizeIcon,
        isStandalone: true,
        selector: "WindowMinimizeIcon",
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `,
        isInline: true
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: WindowMinimizeIcon,
      decorators: [{
        type: Component,
        args: [{
          selector: "WindowMinimizeIcon",
          standalone: true,
          template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.aria-label]="ariaLabel" [attr.aria-hidden]="ariaHidden" [attr.role]="role" [class]="getClassNames()">
            <g [attr.clip-path]="pathId">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath [id]="pathId">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    `
        }]
      }]
    });
  }
});

// node_modules/primeng/fesm2022/primeng-icons.mjs
var init_primeng_icons = __esm({
  "node_modules/primeng/fesm2022/primeng-icons.mjs"() {
    "use strict";
    init_primeng_icons_angledoubledown();
    init_primeng_icons_angledoubleleft();
    init_primeng_icons_angledoubleright();
    init_primeng_icons_angledoubleup();
    init_primeng_icons_angledown();
    init_primeng_icons_angleleft();
    init_primeng_icons_angleright();
    init_primeng_icons_angleup();
    init_primeng_icons_arrowdown();
    init_primeng_icons_arrowdownleft();
    init_primeng_icons_arrowdownright();
    init_primeng_icons_arrowleft();
    init_primeng_icons_arrowright();
    init_primeng_icons_arrowup();
    init_primeng_icons_ban();
    init_primeng_icons_bars();
    init_primeng_icons_blank();
    init_primeng_icons_calendar();
    init_primeng_icons_caretleft();
    init_primeng_icons_caretright();
    init_primeng_icons_check();
    init_primeng_icons_chevrondown();
    init_primeng_icons_chevronleft();
    init_primeng_icons_chevronright();
    init_primeng_icons_chevronup();
    init_primeng_icons_exclamationtriangle();
    init_primeng_icons_eye();
    init_primeng_icons_eyeslash();
    init_primeng_icons_filter();
    init_primeng_icons_filterslash();
    init_primeng_icons_home();
    init_primeng_icons_infocircle();
    init_primeng_icons_minus();
    init_primeng_icons_pencil();
    init_primeng_icons_plus();
    init_primeng_icons_refresh();
    init_primeng_icons_search();
    init_primeng_icons_searchminus();
    init_primeng_icons_searchplus();
    init_primeng_icons_sortalt();
    init_primeng_icons_sortamountdown();
    init_primeng_icons_sortamountupalt();
    init_primeng_icons_spinner();
    init_primeng_icons_star();
    init_primeng_icons_starfill();
    init_primeng_icons_thlarge();
    init_primeng_icons_times();
    init_primeng_icons_timescircle();
    init_primeng_icons_trash();
    init_primeng_icons_undo();
    init_primeng_icons_upload();
    init_primeng_icons_windowmaximize();
    init_primeng_icons_windowminimize();
  }
});

// node_modules/primeng/fesm2022/primeng-utils.mjs
function UniqueComponentId(prefix = "pn_id_") {
  lastId++;
  return `${prefix}${lastId}`;
}
function ZIndexUtils() {
  let zIndexes = [];
  const generateZIndex = (key, baseZIndex) => {
    let lastZIndex = zIndexes.length > 0 ? zIndexes[zIndexes.length - 1] : {
      key,
      value: baseZIndex
    };
    let newZIndex = lastZIndex.value + (lastZIndex.key === key ? 0 : baseZIndex) + 2;
    zIndexes.push({
      key,
      value: newZIndex
    });
    return newZIndex;
  };
  const revertZIndex = (zIndex) => {
    zIndexes = zIndexes.filter((obj) => obj.value !== zIndex);
  };
  const getCurrentZIndex = () => {
    return zIndexes.length > 0 ? zIndexes[zIndexes.length - 1].value : 0;
  };
  const getZIndex = (el) => {
    return el ? parseInt(el.style.zIndex, 10) || 0 : 0;
  };
  return {
    get: getZIndex,
    set: (key, el, baseZIndex) => {
      if (el) {
        el.style.zIndex = String(generateZIndex(key, baseZIndex));
      }
    },
    clear: (el) => {
      if (el) {
        revertZIndex(getZIndex(el));
        el.style.zIndex = "";
      }
    },
    getCurrent: () => getCurrentZIndex(),
    generateZIndex,
    revertZIndex
  };
}
var ObjectUtils, lastId, zindexutils;
var init_primeng_utils = __esm({
  "node_modules/primeng/fesm2022/primeng-utils.mjs"() {
    "use strict";
    ObjectUtils = class _ObjectUtils {
      static isArray(value, empty = true) {
        return Array.isArray(value) && (empty || value.length !== 0);
      }
      static isObject(value, empty = true) {
        return typeof value === "object" && !Array.isArray(value) && value != null && (empty || Object.keys(value).length !== 0);
      }
      static equals(obj1, obj2, field) {
        if (field) return this.resolveFieldData(obj1, field) === this.resolveFieldData(obj2, field);
        else return this.equalsByValue(obj1, obj2);
      }
      static equalsByValue(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 && obj2 && typeof obj1 == "object" && typeof obj2 == "object") {
          var arrA = Array.isArray(obj1), arrB = Array.isArray(obj2), i, length, key;
          if (arrA && arrB) {
            length = obj1.length;
            if (length != obj2.length) return false;
            for (i = length; i-- !== 0; ) if (!this.equalsByValue(obj1[i], obj2[i])) return false;
            return true;
          }
          if (arrA != arrB) return false;
          var dateA = this.isDate(obj1), dateB = this.isDate(obj2);
          if (dateA != dateB) return false;
          if (dateA && dateB) return obj1.getTime() == obj2.getTime();
          var regexpA = obj1 instanceof RegExp, regexpB = obj2 instanceof RegExp;
          if (regexpA != regexpB) return false;
          if (regexpA && regexpB) return obj1.toString() == obj2.toString();
          var keys = Object.keys(obj1);
          length = keys.length;
          if (length !== Object.keys(obj2).length) return false;
          for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(obj2, keys[i])) return false;
          for (i = length; i-- !== 0; ) {
            key = keys[i];
            if (!this.equalsByValue(obj1[key], obj2[key])) return false;
          }
          return true;
        }
        return obj1 !== obj1 && obj2 !== obj2;
      }
      static resolveFieldData(data, field) {
        if (data && field) {
          if (this.isFunction(field)) {
            return field(data);
          } else if (field.indexOf(".") == -1) {
            return data[field];
          } else {
            let fields = field.split(".");
            let value = data;
            for (let i = 0, len = fields.length; i < len; ++i) {
              if (value == null) {
                return null;
              }
              value = value[fields[i]];
            }
            return value;
          }
        } else {
          return null;
        }
      }
      static isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
      }
      static reorderArray(value, from2, to) {
        let target;
        if (value && from2 !== to) {
          if (to >= value.length) {
            to %= value.length;
            from2 %= value.length;
          }
          value.splice(to, 0, value.splice(from2, 1)[0]);
        }
      }
      static insertIntoOrderedArray(item, index, arr, sourceArr) {
        if (arr.length > 0) {
          let injected = false;
          for (let i = 0; i < arr.length; i++) {
            let currentItemIndex = this.findIndexInList(arr[i], sourceArr);
            if (currentItemIndex > index) {
              arr.splice(i, 0, item);
              injected = true;
              break;
            }
          }
          if (!injected) {
            arr.push(item);
          }
        } else {
          arr.push(item);
        }
      }
      static findIndexInList(item, list) {
        let index = -1;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            if (list[i] == item) {
              index = i;
              break;
            }
          }
        }
        return index;
      }
      static contains(value, list) {
        if (value != null && list && list.length) {
          for (let val of list) {
            if (this.equals(value, val)) return true;
          }
        }
        return false;
      }
      static removeAccents(str) {
        if (str) {
          str = str.normalize("NFKD").replace(new RegExp("\\p{Diacritic}", "gu"), "");
        }
        return str;
      }
      static isDate(input2) {
        return Object.prototype.toString.call(input2) === "[object Date]";
      }
      static isEmpty(value) {
        return value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0 || !this.isDate(value) && typeof value === "object" && Object.keys(value).length === 0;
      }
      static isNotEmpty(value) {
        return !this.isEmpty(value);
      }
      static compare(value1, value2, locale, order = 1) {
        let result = -1;
        const emptyValue1 = this.isEmpty(value1);
        const emptyValue2 = this.isEmpty(value2);
        if (emptyValue1 && emptyValue2) result = 0;
        else if (emptyValue1) result = order;
        else if (emptyValue2) result = -order;
        else if (typeof value1 === "string" && typeof value2 === "string") result = value1.localeCompare(value2, locale, {
          numeric: true
        });
        else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
        return result;
      }
      static sort(value1, value2, order = 1, locale, nullSortOrder = 1) {
        const result = _ObjectUtils.compare(value1, value2, locale, order);
        let finalSortOrder = order;
        if (_ObjectUtils.isEmpty(value1) || _ObjectUtils.isEmpty(value2)) {
          finalSortOrder = nullSortOrder === 1 ? order : nullSortOrder;
        }
        return finalSortOrder * result;
      }
      static merge(obj1, obj2) {
        if (obj1 == void 0 && obj2 == void 0) {
          return void 0;
        } else if ((obj1 == void 0 || typeof obj1 === "object") && (obj2 == void 0 || typeof obj2 === "object")) {
          return __spreadValues(__spreadValues({}, obj1 || {}), obj2 || {});
        } else if ((obj1 == void 0 || typeof obj1 === "string") && (obj2 == void 0 || typeof obj2 === "string")) {
          return [obj1 || "", obj2 || ""].join(" ");
        }
        return obj2 || obj1;
      }
      static isPrintableCharacter(char = "") {
        return this.isNotEmpty(char) && char.length === 1 && char.match(/\S| /);
      }
      static getItemValue(obj, ...params) {
        return this.isFunction(obj) ? obj(...params) : obj;
      }
      static findLastIndex(arr, callback) {
        let index = -1;
        if (this.isNotEmpty(arr)) {
          try {
            index = arr.findLastIndex(callback);
          } catch {
            index = arr.lastIndexOf([...arr].reverse().find(callback));
          }
        }
        return index;
      }
      static findLast(arr, callback) {
        let item;
        if (this.isNotEmpty(arr)) {
          try {
            item = arr.findLast(callback);
          } catch {
            item = [...arr].reverse().find(callback);
          }
        }
        return item;
      }
      static deepEquals(a, b) {
        if (a === b) return true;
        if (a && b && typeof a == "object" && typeof b == "object") {
          var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
          if (arrA && arrB) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (!this.deepEquals(a[i], b[i])) return false;
            return true;
          }
          if (arrA != arrB) return false;
          var dateA = a instanceof Date, dateB = b instanceof Date;
          if (dateA != dateB) return false;
          if (dateA && dateB) return a.getTime() == b.getTime();
          var regexpA = a instanceof RegExp, regexpB = b instanceof RegExp;
          if (regexpA != regexpB) return false;
          if (regexpA && regexpB) return a.toString() == b.toString();
          var keys = Object.keys(a);
          length = keys.length;
          if (length !== Object.keys(b).length) return false;
          for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
          for (i = length; i-- !== 0; ) {
            key = keys[i];
            if (!this.deepEquals(a[key], b[key])) return false;
          }
          return true;
        }
        return a !== a && b !== b;
      }
      static minifyCSS(css3) {
        return css3 ? css3.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":") : css3;
      }
      static toFlatCase(str) {
        return this.isString(str) ? str.replace(/(-|_)/g, "").toLowerCase() : str;
      }
      static isString(value, empty = true) {
        return typeof value === "string" && (empty || value !== "");
      }
    };
    lastId = 0;
    zindexutils = ZIndexUtils();
  }
});

// node_modules/primeng/fesm2022/primeng-toast.mjs
var theme2, inlineStyles, classes, ToastStyle, ToastClasses, ToastItem, Toast, ToastModule;
var init_primeng_toast = __esm({
  "node_modules/primeng/fesm2022/primeng-toast.mjs"() {
    "use strict";
    init_animations();
    init_common();
    init_common();
    init_core();
    init_core();
    init_utils();
    init_primeng_api();
    init_primeng_basecomponent();
    init_primeng_icons();
    init_primeng_utils();
    init_primeng_base();
    theme2 = ({
      dt: dt2
    }) => `
.p-toast {
    width: ${dt2("toast.width")};
    white-space: pre-line;
    word-break: break-word;
}

.p-toast-message {
    margin: 0 0 1rem 0;
}

.p-toast-message-icon {
    flex-shrink: 0;
    font-size: ${dt2("toast.icon.size")};
    width: ${dt2("toast.icon.size")};
    height: ${dt2("toast.icon.size")};
}

.p-toast-message-content {
    display: flex;
    align-items: flex-start;
    padding: ${dt2("toast.content.padding")};
    gap: ${dt2("toast.content.gap")};
}

.p-toast-message-text {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: ${dt2("toast.text.gap")};
}

.p-toast-summary {
    font-weight: ${dt2("toast.summary.font.weight")};
    font-size: ${dt2("toast.summary.font.size")};
}

.p-toast-detail {
    font-weight: ${dt2("toast.detail.font.weight")};
    font-size: ${dt2("toast.detail.font.size")};
}

.p-toast-close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background: transparent;
    transition: background ${dt2("toast.transition.duration")}, color ${dt2("toast.transition.duration")}, outline-color ${dt2("toast.transition.duration")}, box-shadow ${dt2("toast.transition.duration")};
    outline-color: transparent;
    color: inherit;
    width: ${dt2("toast.close.button.width")};
    height: ${dt2("toast.close.button.height")};
    border-radius: ${dt2("toast.close.button.border.radius")};
    margin: -25% 0 0 0;
    right: -25%;
    padding: 0;
    border: none;
    user-select: none;
}

.p-toast-close-button:dir(rtl) {
    margin: -25% 0 0 auto;
    left: -25%;
    right: auto;
}

.p-toast-message-info,
.p-toast-message-success,
.p-toast-message-warn,
.p-toast-message-error,
.p-toast-message-secondary,
.p-toast-message-contrast {
    border-width: ${dt2("toast.border.width")};
    border-style: solid;
    backdrop-filter: blur(${dt2("toast.blur")});
    border-radius: ${dt2("toast.border.radius")};
}

.p-toast-close-icon {
    font-size: ${dt2("toast.close.icon.size")};
    width: ${dt2("toast.close.icon.size")};
    height: ${dt2("toast.close.icon.size")};
}

.p-toast-close-button:focus-visible {
    outline-width: ${dt2("focus.ring.width")};
    outline-style: ${dt2("focus.ring.style")};
    outline-offset: ${dt2("focus.ring.offset")};
}

.p-toast-message-info {
    background: ${dt2("toast.info.background")};
    border-color: ${dt2("toast.info.border.color")};
    color: ${dt2("toast.info.color")};
    box-shadow: ${dt2("toast.info.shadow")};
}

.p-toast-message-info .p-toast-detail {
    color: ${dt2("toast.info.detail.color")};
}

.p-toast-message-info .p-toast-close-button:focus-visible {
    outline-color: ${dt2("toast.info.close.button.focus.ring.color")};
    box-shadow: ${dt2("toast.info.close.button.focus.ring.shadow")};
}

.p-toast-message-info .p-toast-close-button:hover {
    background: ${dt2("toast.info.close.button.hover.background")};
}

.p-toast-message-success {
    background: ${dt2("toast.success.background")};
    border-color: ${dt2("toast.success.border.color")};
    color: ${dt2("toast.success.color")};
    box-shadow: ${dt2("toast.success.shadow")};
}

.p-toast-message-success .p-toast-detail {
    color: ${dt2("toast.success.detail.color")};
}

.p-toast-message-success .p-toast-close-button:focus-visible {
    outline-color: ${dt2("toast.success.close.button.focus.ring.color")};
    box-shadow: ${dt2("toast.success.close.button.focus.ring.shadow")};
}

.p-toast-message-success .p-toast-close-button:hover {
    background: ${dt2("toast.success.close.button.hover.background")};
}

.p-toast-message-warn {
    background: ${dt2("toast.warn.background")};
    border-color: ${dt2("toast.warn.border.color")};
    color: ${dt2("toast.warn.color")};
    box-shadow: ${dt2("toast.warn.shadow")};
}

.p-toast-message-warn .p-toast-detail {
    color: ${dt2("toast.warn.detail.color")};
}

.p-toast-message-warn .p-toast-close-button:focus-visible {
    outline-color: ${dt2("toast.warn.close.button.focus.ring.color")};
    box-shadow: ${dt2("toast.warn.close.button.focus.ring.shadow")};
}

.p-toast-message-warn .p-toast-close-button:hover {
    background: ${dt2("toast.warn.close.button.hover.background")};
}

.p-toast-message-error {
    background: ${dt2("toast.error.background")};
    border-color: ${dt2("toast.error.border.color")};
    color: ${dt2("toast.error.color")};
    box-shadow: ${dt2("toast.error.shadow")};
}

.p-toast-message-error .p-toast-detail {
    color: ${dt2("toast.error.detail.color")};
}

.p-toast-message-error .p-toast-close-button:focus-visible {
    outline-color: ${dt2("toast.error.close.button.focus.ring.color")};
    box-shadow: ${dt2("toast.error.close.button.focus.ring.shadow")};
}

.p-toast-message-error .p-toast-close-button:hover {
    background: ${dt2("toast.error.close.button.hover.background")};
}

.p-toast-message-secondary {
    background: ${dt2("toast.secondary.background")};
    border-color: ${dt2("toast.secondary.border.color")};
    color: ${dt2("toast.secondary.color")};
    box-shadow: ${dt2("toast.secondary.shadow")};
}

.p-toast-message-secondary .p-toast-detail {
    color: ${dt2("toast.secondary.detail.color")};
}

.p-toast-message-secondary .p-toast-close-button:focus-visible {
    outline-color: ${dt2("toast.secondary.close.button.focus.ring.color")};
    box-shadow: ${dt2("toast.secondary.close.button.focus.ring.shadow")};
}

.p-toast-message-secondary .p-toast-close-button:hover {
    background: ${dt2("toast.secondary.close.button.hover.background")};
}

.p-toast-message-contrast {
    background: ${dt2("toast.contrast.background")};
    border-color: ${dt2("toast.contrast.border.color")};
    color: ${dt2("toast.contrast.color")};
    box-shadow: ${dt2("toast.contrast.shadow")};
}

.p-toast-message-contrast .p-toast-detail {
    color: ${dt2("toast.contrast.detail.color")};
}

.p-toast-message-contrast .p-toast-close-button:focus-visible {
    outline-color: ${dt2("toast.contrast.close.button.focus.ring.color")};
    box-shadow: ${dt2("toast.contrast.close.button.focus.ring.shadow")};
}

.p-toast-message-contrast .p-toast-close-button:hover {
    background: ${dt2("toast.contrast.close.button.hover.background")};
}

.p-toast-top-center {
    transform: translateX(-50%);
}

.p-toast-bottom-center {
    transform: translateX(-50%);
}

.p-toast-center {
    min-width: 20vw;
    transform: translate(-50%, -50%);
}

.p-toast-message-enter-from {
    opacity: 0;
    transform: translateY(50%);
}

.p-toast-message-leave-from {
    max-height: 1000px;
}

.p-toast .p-toast-message.p-toast-message-leave-to {
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
    overflow: hidden;
}

.p-toast-message-enter-active {
    transition: transform 0.3s, opacity 0.3s;
}

.p-toast-message-leave-active {
    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1), opacity 0.3s, margin-bottom 0.3s;
}
`;
    inlineStyles = {
      root: ({
        instance
      }) => {
        const {
          _position
        } = instance;
        return {
          position: "fixed",
          top: _position === "top-right" || _position === "top-left" || _position === "top-center" ? "20px" : _position === "center" ? "50%" : null,
          right: (_position === "top-right" || _position === "bottom-right") && "20px",
          bottom: (_position === "bottom-left" || _position === "bottom-right" || _position === "bottom-center") && "20px",
          left: _position === "top-left" || _position === "bottom-left" ? "20px" : _position === "center" || _position === "top-center" || _position === "bottom-center" ? "50%" : null
        };
      }
    };
    classes = {
      root: ({
        instance
      }) => ({
        "p-toast p-component": true,
        [`p-toast-${instance._position}`]: !!instance._position
      }),
      message: ({
        instance
      }) => ({
        "p-toast-message": true,
        "p-toast-message-info": instance.message.severity === "info" || instance.message.severity === void 0,
        "p-toast-message-warn": instance.message.severity === "warn",
        "p-toast-message-error": instance.message.severity === "error",
        "p-toast-message-success": instance.message.severity === "success",
        "p-toast-message-secondary": instance.message.severity === "secondary",
        "p-toast-message-contrast": instance.message.severity === "contrast"
      }),
      messageContent: "p-toast-message-content",
      messageIcon: ({
        instance
      }) => ({
        "p-toast-message-icon": true,
        [`pi ${instance.message.icon}`]: !!instance.message.icon
      }),
      messageText: "p-toast-message-text",
      summary: "p-toast-summary",
      detail: "p-toast-detail",
      closeButton: "p-toast-close-button",
      closeIcon: ({
        instance
      }) => ({
        "p-toast-close-icon": true,
        [`pi ${instance.message.closeIcon}`]: !!instance.message.closeIcon
      })
    };
    ToastStyle = class _ToastStyle extends BaseStyle {
      name = "toast";
      theme = theme2;
      classes = classes;
      inlineStyles = inlineStyles;
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ToastStyle,
        deps: null,
        target: FactoryTarget.Injectable
      });
      static \u0275prov = \u0275\u0275ngDeclareInjectable({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ToastStyle
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ToastStyle,
      decorators: [{
        type: Injectable
      }]
    });
    (function(ToastClasses2) {
      ToastClasses2["root"] = "p-toast";
      ToastClasses2["message"] = "p-toast-message";
      ToastClasses2["messageContent"] = "p-toast-message-content";
      ToastClasses2["messageIcon"] = "p-toast-message-icon";
      ToastClasses2["messageText"] = "p-toast-message-text";
      ToastClasses2["summary"] = "p-toast-summary";
      ToastClasses2["detail"] = "p-toast-detail";
      ToastClasses2["closeButton"] = "p-toast-close-button";
      ToastClasses2["closeIcon"] = "p-toast-close-icon";
    })(ToastClasses || (ToastClasses = {}));
    ToastItem = class _ToastItem extends BaseComponent {
      zone;
      message;
      index;
      life;
      template;
      headlessTemplate;
      showTransformOptions;
      hideTransformOptions;
      showTransitionOptions;
      hideTransitionOptions;
      onClose = new EventEmitter();
      containerViewChild;
      _componentStyle = inject(ToastStyle);
      timeout;
      constructor(zone) {
        super();
        this.zone = zone;
      }
      ngAfterViewInit() {
        super.ngAfterViewInit();
        this.initTimeout();
      }
      initTimeout() {
        if (!this.message?.sticky) {
          this.zone.runOutsideAngular(() => {
            this.timeout = setTimeout(() => {
              this.onClose.emit({
                index: this.index,
                message: this.message
              });
            }, this.message?.life || this.life || 3e3);
          });
        }
      }
      clearTimeout() {
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
      }
      onMouseEnter() {
        this.clearTimeout();
      }
      onMouseLeave() {
        this.initTimeout();
      }
      onCloseIconClick = (event) => {
        this.clearTimeout();
        this.onClose.emit({
          index: this.index,
          message: this.message
        });
        event.preventDefault();
      };
      get closeAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.close : void 0;
      }
      ngOnDestroy() {
        this.clearTimeout();
        super.ngOnDestroy();
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ToastItem,
        deps: [{
          token: NgZone
        }],
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "17.0.0",
        version: "19.2.10",
        type: _ToastItem,
        isStandalone: true,
        selector: "p-toastItem",
        inputs: {
          message: "message",
          index: ["index", "index", numberAttribute],
          life: ["life", "life", numberAttribute],
          template: "template",
          headlessTemplate: "headlessTemplate",
          showTransformOptions: "showTransformOptions",
          hideTransformOptions: "hideTransformOptions",
          showTransitionOptions: "showTransitionOptions",
          hideTransitionOptions: "hideTransitionOptions"
        },
        outputs: {
          onClose: "onClose"
        },
        providers: [ToastStyle],
        viewQueries: [{
          propertyName: "containerViewChild",
          first: true,
          predicate: ["container"],
          descendants: true
        }],
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <div
            #container
            [attr.id]="message?.id"
            [class]="message?.styleClass"
            [ngClass]="cx('message')"
            [@messageState]="{
                value: 'visible',
                params: {
                    showTransformParams: showTransformOptions,
                    hideTransformParams: hideTransformOptions,
                    showTransitionParams: showTransitionOptions,
                    hideTransitionParams: hideTransitionOptions
                }
            }"
            (mouseenter)="onMouseEnter()"
            (mouseleave)="onMouseLeave()"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            [attr.data-pc-name]="'toast'"
            [attr.data-pc-section]="'root'"
        >
            @if (headlessTemplate) {
                <ng-container *ngTemplateOutlet="headlessTemplate; context: { $implicit: message, closeFn: onCloseIconClick }"></ng-container>
            } @else {
                <div [ngClass]="cx('messageContent')" [class]="message?.contentStyleClass" [attr.data-pc-section]="'content'">
                    <ng-container *ngIf="!template">
                        <span *ngIf="message.icon" [ngClass]="cx('messageIcon')"></span>
                        <span [ngClass]="cx('messageIcon')" *ngIf="!message.icon" [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'">
                            @switch (message.severity) {
                                @case ('success') {
                                    <CheckIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @case ('info') {
                                    <InfoCircleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @case ('error') {
                                    <TimesCircleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @case ('warn') {
                                    <ExclamationTriangleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @default {
                                    <InfoCircleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                            }
                        </span>
                        <div [ngClass]="cx('messageText')" [attr.data-pc-section]="'text'">
                            <div [ngClass]="cx('summary')" [attr.data-pc-section]="'summary'">
                                {{ message.summary }}
                            </div>
                            <div [ngClass]="cx('detail')" [attr.data-pc-section]="'detail'">{{ message.detail }}</div>
                        </div>
                    </ng-container>
                    <ng-container *ngTemplateOutlet="template; context: { $implicit: message }"></ng-container>
                    @if (message?.closable !== false) {
                        <div>
                            <button type="button" [attr.class]="cx('closeButton')" (click)="onCloseIconClick($event)" (keydown.enter)="onCloseIconClick($event)" [ariaLabel]="closeAriaLabel" [attr.data-pc-section]="'closebutton'" autofocus>
                                @if (message.closeIcon) {
                                    <span *ngIf="message.closeIcon" [ngClass]="cx('closeIcon')"></span>
                                } @else {
                                    <TimesIcon [ngClass]="cx('closeIcon')" [attr.aria-hidden]="true" [attr.data-pc-section]="'closeicon'" />
                                }
                            </button>
                        </div>
                    }
                </div>
            }
        </div>
    `,
        isInline: true,
        dependencies: [{
          kind: "ngmodule",
          type: CommonModule
        }, {
          kind: "directive",
          type: NgClass,
          selector: "[ngClass]",
          inputs: ["class", "ngClass"]
        }, {
          kind: "directive",
          type: NgIf,
          selector: "[ngIf]",
          inputs: ["ngIf", "ngIfThen", "ngIfElse"]
        }, {
          kind: "directive",
          type: NgTemplateOutlet,
          selector: "[ngTemplateOutlet]",
          inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"]
        }, {
          kind: "component",
          type: CheckIcon,
          selector: "CheckIcon"
        }, {
          kind: "component",
          type: ExclamationTriangleIcon,
          selector: "ExclamationTriangleIcon"
        }, {
          kind: "component",
          type: InfoCircleIcon,
          selector: "InfoCircleIcon"
        }, {
          kind: "component",
          type: TimesIcon,
          selector: "TimesIcon"
        }, {
          kind: "component",
          type: TimesCircleIcon,
          selector: "TimesCircleIcon"
        }, {
          kind: "ngmodule",
          type: SharedModule
        }],
        animations: [trigger("messageState", [state("visible", style({
          transform: "translateY(0)",
          opacity: 1
        })), transition("void => *", [style({
          transform: "{{showTransformParams}}",
          opacity: 0
        }), animate("{{showTransitionParams}}")]), transition("* => void", [animate("{{hideTransitionParams}}", style({
          height: 0,
          opacity: 0,
          transform: "{{hideTransformParams}}"
        }))])])],
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ToastItem,
      decorators: [{
        type: Component,
        args: [{
          selector: "p-toastItem",
          standalone: true,
          imports: [CommonModule, CheckIcon, ExclamationTriangleIcon, InfoCircleIcon, TimesIcon, TimesCircleIcon, SharedModule],
          template: `
        <div
            #container
            [attr.id]="message?.id"
            [class]="message?.styleClass"
            [ngClass]="cx('message')"
            [@messageState]="{
                value: 'visible',
                params: {
                    showTransformParams: showTransformOptions,
                    hideTransformParams: hideTransformOptions,
                    showTransitionParams: showTransitionOptions,
                    hideTransitionParams: hideTransitionOptions
                }
            }"
            (mouseenter)="onMouseEnter()"
            (mouseleave)="onMouseLeave()"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            [attr.data-pc-name]="'toast'"
            [attr.data-pc-section]="'root'"
        >
            @if (headlessTemplate) {
                <ng-container *ngTemplateOutlet="headlessTemplate; context: { $implicit: message, closeFn: onCloseIconClick }"></ng-container>
            } @else {
                <div [ngClass]="cx('messageContent')" [class]="message?.contentStyleClass" [attr.data-pc-section]="'content'">
                    <ng-container *ngIf="!template">
                        <span *ngIf="message.icon" [ngClass]="cx('messageIcon')"></span>
                        <span [ngClass]="cx('messageIcon')" *ngIf="!message.icon" [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'">
                            @switch (message.severity) {
                                @case ('success') {
                                    <CheckIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @case ('info') {
                                    <InfoCircleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @case ('error') {
                                    <TimesCircleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @case ('warn') {
                                    <ExclamationTriangleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                                @default {
                                    <InfoCircleIcon [attr.aria-hidden]="true" [attr.data-pc-section]="'icon'" />
                                }
                            }
                        </span>
                        <div [ngClass]="cx('messageText')" [attr.data-pc-section]="'text'">
                            <div [ngClass]="cx('summary')" [attr.data-pc-section]="'summary'">
                                {{ message.summary }}
                            </div>
                            <div [ngClass]="cx('detail')" [attr.data-pc-section]="'detail'">{{ message.detail }}</div>
                        </div>
                    </ng-container>
                    <ng-container *ngTemplateOutlet="template; context: { $implicit: message }"></ng-container>
                    @if (message?.closable !== false) {
                        <div>
                            <button type="button" [attr.class]="cx('closeButton')" (click)="onCloseIconClick($event)" (keydown.enter)="onCloseIconClick($event)" [ariaLabel]="closeAriaLabel" [attr.data-pc-section]="'closebutton'" autofocus>
                                @if (message.closeIcon) {
                                    <span *ngIf="message.closeIcon" [ngClass]="cx('closeIcon')"></span>
                                } @else {
                                    <TimesIcon [ngClass]="cx('closeIcon')" [attr.aria-hidden]="true" [attr.data-pc-section]="'closeicon'" />
                                }
                            </button>
                        </div>
                    }
                </div>
            }
        </div>
    `,
          animations: [trigger("messageState", [state("visible", style({
            transform: "translateY(0)",
            opacity: 1
          })), transition("void => *", [style({
            transform: "{{showTransformParams}}",
            opacity: 0
          }), animate("{{showTransitionParams}}")]), transition("* => void", [animate("{{hideTransitionParams}}", style({
            height: 0,
            opacity: 0,
            transform: "{{hideTransformParams}}"
          }))])])],
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          providers: [ToastStyle]
        }]
      }],
      ctorParameters: () => [{
        type: NgZone
      }],
      propDecorators: {
        message: [{
          type: Input
        }],
        index: [{
          type: Input,
          args: [{
            transform: numberAttribute
          }]
        }],
        life: [{
          type: Input,
          args: [{
            transform: numberAttribute
          }]
        }],
        template: [{
          type: Input
        }],
        headlessTemplate: [{
          type: Input
        }],
        showTransformOptions: [{
          type: Input
        }],
        hideTransformOptions: [{
          type: Input
        }],
        showTransitionOptions: [{
          type: Input
        }],
        hideTransitionOptions: [{
          type: Input
        }],
        onClose: [{
          type: Output
        }],
        containerViewChild: [{
          type: ViewChild,
          args: ["container"]
        }]
      }
    });
    Toast = class _Toast extends BaseComponent {
      /**
       * Key of the message in case message is targeted to a specific toast component.
       * @group Props
       */
      key;
      /**
       * Whether to automatically manage layering.
       * @group Props
       */
      autoZIndex = true;
      /**
       * Base zIndex value to use in layering.
       * @group Props
       */
      baseZIndex = 0;
      /**
       * The default time to display messages for in milliseconds.
       * @group Props
       */
      life = 3e3;
      /**
       * Inline style of the component.
       * @group Props
       */
      style;
      /**
       * Inline class of the component.
       * @group Props
       */
      styleClass;
      /**
       * Position of the toast in viewport.
       * @group Props
       */
      get position() {
        return this._position;
      }
      set position(value) {
        this._position = value;
        this.cd.markForCheck();
      }
      /**
       * It does not add the new message if there is already a toast displayed with the same content
       * @group Props
       */
      preventOpenDuplicates = false;
      /**
       * Displays only once a message with the same content.
       * @group Props
       */
      preventDuplicates = false;
      /**
       * Transform options of the show animation.
       * @group Props
       */
      showTransformOptions = "translateY(100%)";
      /**
       * Transform options of the hide animation.
       * @group Props
       */
      hideTransformOptions = "translateY(-100%)";
      /**
       * Transition options of the show animation.
       * @group Props
       */
      showTransitionOptions = "300ms ease-out";
      /**
       * Transition options of the hide animation.
       * @group Props
       */
      hideTransitionOptions = "250ms ease-in";
      /**
       * Object literal to define styles per screen size.
       * @group Props
       */
      breakpoints;
      /**
       * Callback to invoke when a message is closed.
       * @param {ToastCloseEvent} event - custom close event.
       * @group Emits
       */
      onClose = new EventEmitter();
      /**
       * Custom template of message.
       * @group Templates
       */
      template;
      /**
       * Custom headless template.
       * @group Templates
       */
      headlessTemplate;
      containerViewChild;
      messageSubscription;
      clearSubscription;
      messages;
      messagesArchieve;
      _position = "top-right";
      messageService = inject(MessageService);
      _componentStyle = inject(ToastStyle);
      styleElement;
      id = uuid("pn_id_");
      templates;
      ngOnInit() {
        super.ngOnInit();
        this.messageSubscription = this.messageService.messageObserver.subscribe((messages) => {
          if (messages) {
            if (Array.isArray(messages)) {
              const filteredMessages = messages.filter((m) => this.canAdd(m));
              this.add(filteredMessages);
            } else if (this.canAdd(messages)) {
              this.add([messages]);
            }
          }
        });
        this.clearSubscription = this.messageService.clearObserver.subscribe((key) => {
          if (key) {
            if (this.key === key) {
              this.messages = null;
            }
          } else {
            this.messages = null;
          }
          this.cd.markForCheck();
        });
      }
      _template;
      _headlessTemplate;
      ngAfterContentInit() {
        this.templates?.forEach((item) => {
          switch (item.getType()) {
            case "message":
              this._template = item.template;
              break;
            case "headless":
              this._headlessTemplate = item.template;
              break;
            default:
              this._template = item.template;
              break;
          }
        });
      }
      ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.breakpoints) {
          this.createStyle();
        }
      }
      add(messages) {
        this.messages = this.messages ? [...this.messages, ...messages] : [...messages];
        if (this.preventDuplicates) {
          this.messagesArchieve = this.messagesArchieve ? [...this.messagesArchieve, ...messages] : [...messages];
        }
        this.cd.markForCheck();
      }
      canAdd(message) {
        let allow = this.key === message.key;
        if (allow && this.preventOpenDuplicates) {
          allow = !this.containsMessage(this.messages, message);
        }
        if (allow && this.preventDuplicates) {
          allow = !this.containsMessage(this.messagesArchieve, message);
        }
        return allow;
      }
      containsMessage(collection, message) {
        if (!collection) {
          return false;
        }
        return collection.find((m) => {
          return m.summary === message.summary && m.detail == message.detail && m.severity === message.severity;
        }) != null;
      }
      onMessageClose(event) {
        this.messages?.splice(event.index, 1);
        this.onClose.emit({
          message: event.message
        });
        this.cd.detectChanges();
      }
      onAnimationStart(event) {
        if (event.fromState === "void") {
          this.renderer.setAttribute(this.containerViewChild?.nativeElement, this.id, "");
          if (this.autoZIndex && this.containerViewChild?.nativeElement.style.zIndex === "") {
            zindexutils.set("modal", this.containerViewChild?.nativeElement, this.baseZIndex || this.config.zIndex.modal);
          }
        }
      }
      onAnimationEnd(event) {
        if (event.toState === "void") {
          if (this.autoZIndex && isEmpty(this.messages)) {
            zindexutils.clear(this.containerViewChild?.nativeElement);
          }
        }
      }
      createStyle() {
        if (!this.styleElement) {
          this.styleElement = this.renderer.createElement("style");
          this.styleElement.type = "text/css";
          this.renderer.appendChild(this.document.head, this.styleElement);
          let innerHTML = "";
          for (let breakpoint in this.breakpoints) {
            let breakpointStyle = "";
            for (let styleProp in this.breakpoints[breakpoint]) {
              breakpointStyle += styleProp + ":" + this.breakpoints[breakpoint][styleProp] + " !important;";
            }
            innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-toast[${this.id}] {
                           ${breakpointStyle}
                        }
                    }
                `;
          }
          this.renderer.setProperty(this.styleElement, "innerHTML", innerHTML);
          setAttribute(this.styleElement, "nonce", this.config?.csp()?.nonce);
        }
      }
      destroyStyle() {
        if (this.styleElement) {
          this.renderer.removeChild(this.document.head, this.styleElement);
          this.styleElement = null;
        }
      }
      ngOnDestroy() {
        if (this.messageSubscription) {
          this.messageSubscription.unsubscribe();
        }
        if (this.containerViewChild && this.autoZIndex) {
          zindexutils.clear(this.containerViewChild.nativeElement);
        }
        if (this.clearSubscription) {
          this.clearSubscription.unsubscribe();
        }
        this.destroyStyle();
        super.ngOnDestroy();
      }
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _Toast,
        deps: null,
        target: FactoryTarget.Component
      });
      static \u0275cmp = \u0275\u0275ngDeclareComponent({
        minVersion: "16.1.0",
        version: "19.2.10",
        type: _Toast,
        isStandalone: true,
        selector: "p-toast",
        inputs: {
          key: "key",
          autoZIndex: ["autoZIndex", "autoZIndex", booleanAttribute],
          baseZIndex: ["baseZIndex", "baseZIndex", numberAttribute],
          life: ["life", "life", numberAttribute],
          style: "style",
          styleClass: "styleClass",
          position: "position",
          preventOpenDuplicates: ["preventOpenDuplicates", "preventOpenDuplicates", booleanAttribute],
          preventDuplicates: ["preventDuplicates", "preventDuplicates", booleanAttribute],
          showTransformOptions: "showTransformOptions",
          hideTransformOptions: "hideTransformOptions",
          showTransitionOptions: "showTransitionOptions",
          hideTransitionOptions: "hideTransitionOptions",
          breakpoints: "breakpoints"
        },
        outputs: {
          onClose: "onClose"
        },
        providers: [ToastStyle],
        queries: [{
          propertyName: "template",
          first: true,
          predicate: ["message"],
          descendants: true
        }, {
          propertyName: "headlessTemplate",
          first: true,
          predicate: ["headless"],
          descendants: true
        }, {
          propertyName: "templates",
          predicate: PrimeTemplate
        }],
        viewQueries: [{
          propertyName: "containerViewChild",
          first: true,
          predicate: ["container"],
          descendants: true
        }],
        usesInheritance: true,
        ngImport: core_exports,
        template: `
        <div #container [ngClass]="cx('root')" [ngStyle]="sx('root')" [style]="style" [class]="styleClass">
            <p-toastItem
                *ngFor="let msg of messages; let i = index"
                [message]="msg"
                [index]="i"
                [life]="life"
                (onClose)="onMessageClose($event)"
                [template]="template || _template"
                [headlessTemplate]="headlessTemplate || _headlessTemplate"
                @toastAnimation
                (@toastAnimation.start)="onAnimationStart($event)"
                (@toastAnimation.done)="onAnimationEnd($event)"
                [showTransformOptions]="showTransformOptions"
                [hideTransformOptions]="hideTransformOptions"
                [showTransitionOptions]="showTransitionOptions"
                [hideTransitionOptions]="hideTransitionOptions"
            ></p-toastItem>
        </div>
    `,
        isInline: true,
        dependencies: [{
          kind: "ngmodule",
          type: CommonModule
        }, {
          kind: "directive",
          type: NgClass,
          selector: "[ngClass]",
          inputs: ["class", "ngClass"]
        }, {
          kind: "directive",
          type: NgForOf,
          selector: "[ngFor][ngForOf]",
          inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"]
        }, {
          kind: "directive",
          type: NgStyle,
          selector: "[ngStyle]",
          inputs: ["ngStyle"]
        }, {
          kind: "component",
          type: ToastItem,
          selector: "p-toastItem",
          inputs: ["message", "index", "life", "template", "headlessTemplate", "showTransformOptions", "hideTransformOptions", "showTransitionOptions", "hideTransitionOptions"],
          outputs: ["onClose"]
        }, {
          kind: "ngmodule",
          type: SharedModule
        }],
        animations: [trigger("toastAnimation", [transition(":enter, :leave", [query("@*", animateChild())])])],
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: Toast,
      decorators: [{
        type: Component,
        args: [{
          selector: "p-toast",
          standalone: true,
          imports: [CommonModule, ToastItem, SharedModule],
          template: `
        <div #container [ngClass]="cx('root')" [ngStyle]="sx('root')" [style]="style" [class]="styleClass">
            <p-toastItem
                *ngFor="let msg of messages; let i = index"
                [message]="msg"
                [index]="i"
                [life]="life"
                (onClose)="onMessageClose($event)"
                [template]="template || _template"
                [headlessTemplate]="headlessTemplate || _headlessTemplate"
                @toastAnimation
                (@toastAnimation.start)="onAnimationStart($event)"
                (@toastAnimation.done)="onAnimationEnd($event)"
                [showTransformOptions]="showTransformOptions"
                [hideTransformOptions]="hideTransformOptions"
                [showTransitionOptions]="showTransitionOptions"
                [hideTransitionOptions]="hideTransitionOptions"
            ></p-toastItem>
        </div>
    `,
          animations: [trigger("toastAnimation", [transition(":enter, :leave", [query("@*", animateChild())])])],
          changeDetection: ChangeDetectionStrategy.OnPush,
          encapsulation: ViewEncapsulation.None,
          providers: [ToastStyle]
        }]
      }],
      propDecorators: {
        key: [{
          type: Input
        }],
        autoZIndex: [{
          type: Input,
          args: [{
            transform: booleanAttribute
          }]
        }],
        baseZIndex: [{
          type: Input,
          args: [{
            transform: numberAttribute
          }]
        }],
        life: [{
          type: Input,
          args: [{
            transform: numberAttribute
          }]
        }],
        style: [{
          type: Input
        }],
        styleClass: [{
          type: Input
        }],
        position: [{
          type: Input
        }],
        preventOpenDuplicates: [{
          type: Input,
          args: [{
            transform: booleanAttribute
          }]
        }],
        preventDuplicates: [{
          type: Input,
          args: [{
            transform: booleanAttribute
          }]
        }],
        showTransformOptions: [{
          type: Input
        }],
        hideTransformOptions: [{
          type: Input
        }],
        showTransitionOptions: [{
          type: Input
        }],
        hideTransitionOptions: [{
          type: Input
        }],
        breakpoints: [{
          type: Input
        }],
        onClose: [{
          type: Output
        }],
        template: [{
          type: ContentChild,
          args: ["message"]
        }],
        headlessTemplate: [{
          type: ContentChild,
          args: ["headless"]
        }],
        containerViewChild: [{
          type: ViewChild,
          args: ["container"]
        }],
        templates: [{
          type: ContentChildren,
          args: [PrimeTemplate]
        }]
      }
    });
    ToastModule = class _ToastModule {
      static \u0275fac = \u0275\u0275ngDeclareFactory({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ToastModule,
        deps: [],
        target: FactoryTarget.NgModule
      });
      static \u0275mod = \u0275\u0275ngDeclareNgModule({
        minVersion: "14.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ToastModule,
        imports: [Toast, SharedModule],
        exports: [Toast, SharedModule]
      });
      static \u0275inj = \u0275\u0275ngDeclareInjector({
        minVersion: "12.0.0",
        version: "19.2.10",
        ngImport: core_exports,
        type: _ToastModule,
        imports: [Toast, SharedModule, SharedModule]
      });
    };
    \u0275\u0275ngDeclareClassMetadata({
      minVersion: "12.0.0",
      version: "19.2.10",
      ngImport: core_exports,
      type: ToastModule,
      decorators: [{
        type: NgModule,
        args: [{
          imports: [Toast, SharedModule],
          exports: [Toast, SharedModule]
        }]
      }]
    });
  }
});

export {
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  ActivatedRoute,
  RouterOutlet,
  Router,
  init_router,
  trigger,
  animate,
  style,
  state,
  transition,
  animation,
  useAnimation,
  init_animations,
  hasClass,
  addClass,
  blockBodyScroll,
  removeClass,
  unblockBodyScroll,
  getViewport,
  getWindowScrollLeft,
  getWindowScrollTop,
  absolutePosition,
  addStyle,
  getOuterWidth,
  relativePosition,
  appendChild,
  fadeIn,
  find,
  findSingle,
  focus,
  getFocusableElements,
  getFirstFocusableElement,
  getHeight,
  getIndex,
  getLastFocusableElement,
  getOffset,
  getOuterHeight,
  getSelection,
  getTargetElement,
  getWidth,
  isVisible,
  isHidden,
  isTouchDevice,
  remove,
  removeChild,
  scrollInView,
  setAttribute,
  isEmpty,
  deepEquals,
  isNotEmpty,
  resolveFieldData,
  equals,
  contains,
  findLastIndex,
  isArray,
  isDate,
  isPrintableCharacter,
  uuid,
  init_utils,
  FilterMatchMode,
  FilterOperator,
  FilterService,
  MessageService,
  OverlayService,
  Header,
  Footer,
  PrimeTemplate,
  SharedModule,
  TranslationKeys,
  init_primeng_api,
  BaseStyle,
  init_primeng_base,
  BaseComponent,
  init_primeng_basecomponent,
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  AngleDownIcon,
  AngleLeftIcon,
  AngleRightIcon,
  AngleUpIcon,
  ArrowDownIcon,
  init_primeng_icons_arrowdown,
  ArrowUpIcon,
  init_primeng_icons_arrowup,
  BlankIcon,
  CalendarIcon,
  CheckIcon,
  init_primeng_icons_check,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  FilterIcon,
  init_primeng_icons_filter,
  FilterSlashIcon,
  init_primeng_icons_filterslash,
  MinusIcon,
  PlusIcon,
  init_primeng_icons_plus,
  SearchIcon,
  SortAltIcon,
  init_primeng_icons_sortalt,
  SortAmountDownIcon,
  init_primeng_icons_sortamountdown,
  SortAmountUpAltIcon,
  init_primeng_icons_sortamountupalt,
  SpinnerIcon,
  init_primeng_icons_spinner,
  TimesIcon,
  TimesCircleIcon,
  TrashIcon,
  init_primeng_icons_trash,
  init_primeng_icons,
  ObjectUtils,
  UniqueComponentId,
  zindexutils,
  init_primeng_utils,
  ToastModule,
  init_primeng_toast
};
/*! Bundled license information:

@angular/router/fesm2022/router-Dwfin5Au.mjs:
@angular/router/fesm2022/router.mjs:
@angular/animations/fesm2022/private_export-faY_wCkZ.mjs:
@angular/animations/fesm2022/animations.mjs:
  (**
   * @license Angular v19.2.14
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=chunk-AHT3KQPM.js.map
