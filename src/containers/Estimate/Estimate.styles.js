
const styles = {}
styles.basics = {
    textAlign: 'left',
    fontFamily: 'verdana',
}
styles.welcome = {
    border: '1px solid #47bde8',
    background: '#afe4ff',
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    width: '100%',
}
styles.header = {
    position: 'fixed',
    top: 0,
    width: '100vw',
    height: 80,
    borderBottom: '2px solid black',
    marginBottom: 10,
    paddingBottom: 10,
    background: '#fff',
    padding: '5px 45px',
    zIndex: 100,
}
styles.ui = {}
styles.ui.wrapper = {
    margin: '20px 28px',
    display: 'flex',
}
styles.ui.nestable = {
    flex: 1,
    display: 'flex',
}
styles.nestableComponent = {
    flex: '1',
}
styles.logo = {
    float: 'left',
    color: '#fff',
    margin: 0,
    fontWeight: 'normal',
    fontSize: '14pt',
    height: 60,
    overflow: 'hidden',
    width: '100%',
    marginTop: 25,
    marginLeft: 20,
}
styles.layout = {}
styles.layout.content = {
    background: '#fff',
    marginTop: 80,
    marginLeft: 200,
}
styles.layout.leftSider = {
    position: 'fixed',
    height: '100vh',
    overflow: 'auto',
}
styles.layout.sider = {
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    color: '#ddd',
    position: 'fixed',
    top: 80,
    width: 450,
    height: 'calc(100vh - 80px)',
    overflow: 'auto',
    right: 0,
    borderLeft: '2px solid #666',
}

export default styles
